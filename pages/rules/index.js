import React from 'react'
import classnames from 'classnames'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import { utils } from 'ethers'
import { MesonClient } from '@mesonfi/sdk'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table, { Td } from 'components/Table'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'

import fetcher from 'lib/fetcher'
import { getAllNetworks } from 'lib/swap'
import { RELAYERS } from 'lib/const'

import { SwapRuleModal, GasCalculation } from './components'

export default function RulesNetwork () {
  const router = useRouter()

  const networks = getAllNetworks()
  const { data, error, mutate } = useSWR('admin/rules?type=network', fetcher)
  const { data: gasData, error: gasError, mutate: gasMutate } = useSWR(`${RELAYERS[0]}/api/v1/rules/all:gas`, fetcher)

  const [modalData, setModalData] = React.useState()
  const [gasModalData, setGasModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (gasError) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{gasError.message}</div>
  } else if (!data || !gasData) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        {
          name: '',
          width: '2%',
          className: 'pl-4 md:pl-6'
        },
        {
          name: (
            <div className='flex flex-row min-w-[240px]'>
              <div className='w-10 shrink-0'>from</div>
              <div className='flex flex-row items-center flex-1 gap-1'>
                <div className='flex-1 shrink-0 font-normal text-gray-300'>factor</div>
                <div className='flex-1 shrink-0 font-normal text-gray-300'>min</div>
                <div className='flex-1 shrink-0 font-normal text-gray-300'>limit</div>
              </div>
            </div>
          ),
          width: '25%'
        },
        {
          name: (
            <div className='flex flex-row min-w-[240px]'>
              <div className='w-10 shrink-0'>to</div>
              <div className='flex flex-row items-center flex-1 gap-1'>
                <div className='flex-1 shrink-0 font-normal text-gray-300'>factor</div>
                <div className='flex-1 shrink-0 font-normal text-gray-300'>min</div>
                <div className='flex-1 shrink-0 font-normal text-gray-300'>limit</div>
              </div>
            </div>
          ),
          width: '25%'
        },
        {
          name: (
            <div className='flex flex-row items-center min-w-[480px]'>
              <div className='w-10 shrink-0'><div className='block w-20'>gas fee</div></div>
              <div className='flex flex-row items-center flex-1 gap-2 font-normal text-gray-300'>
                <div className='flex-[1.5] shrink-0'></div>
                <div>=</div>
                <div className='flex-[1.2] shrink-0'>gas</div>
                <div>×</div>
                <div className='flex-[2.5] shrink-0'>gas price</div>
                <div>×</div>
                <div className='flex-[2] shrink-0'>token</div>
                <div>×</div>
                <div className='flex-1 shrink-0'>multi</div>
              </div>
            </div>
          ),
          width: '48%'
        },
      ]}>
      {
        networks.map((n, i) => (
          <RowSwapRule
            key={i}
            network={n}
            rules={data}
            gasRules={gasData.rules}
            prices={gasData.prices}
            onOpenModal={setModalData}
            onOpenGasModal={setGasModalData}
          />
        ))
      }
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Fee Rules'
        tabs={[
          { key: 'network', name: 'Network', active: true },
          { key: 'gas', name: 'Gas', onClick: () => router.push(`/rules/gas`) },
          { key: 'token', name: 'Token', onClick: () => router.push(`/rules/token`) },
          { key: 'address', name: 'Address', onClick: () => router.push(`/rules/address`) },
        ]}
      />
      <CardBody>{body}</CardBody>
      <SwapRuleModal
        type='network'
        hides={['priority', 'rules', 'gas', 'initiators', 'marks']}
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      />
      <SwapRuleModal
        type='gas'
        hides={['priority', 'limit', 'factor', 'minimum', 'initiators', 'marks']}
        data={gasModalData}
        onClose={refresh => {
          setGasModalData()
          refresh && gasMutate()
        }}
      />
    </Card>
  )
}

const tokens = ['stablecoins', 'eth', 'btc', 'bnb']
function RowSwapRule ({ network, rules, gasRules, prices, onOpenModal, onOpenGasModal }) {
  const tokensForNetwork = React.useMemo(() => {
    const ts = network.tokens.map(t => MesonClient.tokenType(t.tokenIndex))
    return tokens.filter(t => ts.includes(t))
  }, [network])

  const fromRule = React.useMemo(() => {
    const stablecoins = getRule(rules, { from: network.id, to: '*', priority: 20 })
    const eth = getRule(rules, { from: `${network.id}:ETH`, to: '*:ETH', priority: 20 })
    const btc = getRule(rules, { from: `${network.id}:BTC`, to: '*:BTC', priority: 20 })
    const bnb = getRule(rules, { from: `${network.id}:BNB`, to: '*:BNB', priority: 20 })
    return { stablecoins, eth, btc, bnb }
  }, [network, rules])

  const toRule = React.useMemo(() => {
    const stablecoins = getRule(rules, { to: network.id, from: '*', priority: 20 })
    const eth = getRule(rules, { to: `${network.id}:ETH`, from: '*:ETH', priority: 20 })
    const btc = getRule(rules, { to: `${network.id}:BTC`, from: '*:BTC', priority: 20 })
    const bnb = getRule(rules, { to: `${network.id}:BNB`, from: '*:BNB', priority: 20 })
    return { stablecoins, eth, btc, bnb }
  }, [network, rules])

  const gasRule = React.useMemo(() => {
    const stablecoins = getRule(gasRules, { to: network.id, from: '*', priority: 10 })
    const eth = getRule(gasRules, { to: `${network.id}:ETH`, from: '*:ETH', priority: 10 })
    const btc = getRule(gasRules, { to: `${network.id}:BTC`, from: '*:BTC', priority: 10 })
    const bnb = getRule(gasRules, { to: `${network.id}:BNB`, from: '*:BNB', priority: 10 })
    return { stablecoins, eth, btc, bnb }
  }, [network, gasRules])

  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1'>
        <TagNetwork size='md' iconOnly network={network} />
      </Td>
      <Td size='sm'>
        <div className='flex flex-col gap-1'>
          {tokensForNetwork.map(t => (
            <div key={t} className='flex flex-row items-center'>
              <div className='w-10 shrink-0'>
                <TagNetworkToken token={{ symbol: t.toUpperCase() }} iconOnly />
              </div>
              <NetworkRuleItem rule={fromRule[t]} onOpenModal={onOpenModal} />
            </div>
          ))}
        </div>
      </Td>
      <Td size='sm'>
        <div className='flex flex-col gap-1'>
          {tokensForNetwork.map(t => (
            <div key={t} className='flex flex-row items-center'>
              <div className='w-10 shrink-0'>
                <TagNetworkToken token={{ symbol: t.toUpperCase() }} iconOnly />
              </div>
              <NetworkRuleItem rule={toRule[t]} onOpenModal={onOpenModal} />
            </div>
          ))}
        </div>
      </Td>
      <Td size='sm'>
        <div className='flex flex-col gap-1'>
          {tokensForNetwork.map(t => (
            <div key={t} className='flex flex-row items-center'>
              <div className='w-10 shrink-0'>
                <TagNetworkToken token={{ symbol: t.toUpperCase() }} iconOnly />
              </div>
              <GasRuleItem rule={gasRule[t]} prices={prices} onOpenModal={onOpenGasModal} />
            </div>
          ))}
        </div>
      </Td>
    </tr>
  )
}

function getRule(rules, condition) {
  return rules.find(r => r.from === condition.from && r.to === condition.to) || condition
}

function NetworkRuleItem ({ rule, onOpenModal }) {
  const commonClassname = 'group flex flex-row flex-1 shrink-0 gap-1 leading-4 hover:text-primary hover:underline cursor-pointer'
  if (!rule?._id) {
    return (
      <div
        className={classnames(commonClassname, 'text-gray-200')}
        onClick={() => onOpenModal({ ...rule, create: true })}
      >
        (add rule)
      </div>
    )
  }

  return (
    <div className={commonClassname} onClick={() => onOpenModal(rule)}>
      <div className={classnames(
        'flex-1 shrink-0 group-hover:text-primary',
        rule.factor === 1 && 'text-gray-500',
        rule.factor > 0.995 && rule.factor <= 0.998 && 'text-indigo-500',
        rule.factor > 0.99 && rule.factor <= 0.995 && 'bg-indigo-300 !text-white group-hover:opacity-50',
        rule.factor > 0.9 && rule.factor <= 0.99 && 'bg-warning !text-white group-hover:opacity-50',
        rule.factor && rule.factor <= 0.9 && 'bg-red-500 !text-white group-hover:opacity-50',
      )}>
        {rule.factor && `${(10000 - rule.factor * 10000)/10}${rule.factor < 1 ? '‰' : ''}`}
      </div>
      <div className='flex-1 shrink-0'>
        {rule.minimum && utils.formatUnits(rule.minimum, 6)}
      </div>
      <div className={classnames('flex-1 shrink-0 group-hover:text-primary', rule.limit === 0 && 'bg-red-500 !text-white group-hover:opacity-50')}>
        {rule.limit}
      </div>
    </div>
  )
}

function GasRuleItem ({ rule, prices, onOpenModal }) {
  const commonClassname = 'group flex flex-row flex-[10] shrink-0 leading-4 hover:text-primary hover:underline cursor-pointer'
  if (!rule?.fee) {
    return (
      <div
        className={classnames(commonClassname, 'text-gray-200')}
        onClick={() => onOpenModal({ ...rule, create: !rule.fee })}
      >
        (add rule)
      </div>
    )
  }

  const isETH = rule.to.endsWith('ETH')
  const isBTC = rule.to.endsWith('BTC')
  const isBNB = rule.to.endsWith('BNB')
  const nonStablecoin = isETH || isBTC || isBNB

  return (
    <div className={commonClassname} onClick={() => onOpenModal(rule)}>
      {rule.fee.map((item, i) => <GasCalculation key={i} {...item} noIcon nonStablecoin={nonStablecoin} prices={prices} gasPrice={rule.gasPrice} gasPriceL0={rule.gasPriceL0} />)}
    </div>
  )
}
