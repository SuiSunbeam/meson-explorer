import React from 'react'
import classnames from 'classnames'

import { useRouter } from 'next/router'
import useSWR from 'swr'

import { utils } from 'ethers'
import { MesonClient } from '@mesonfi/sdk'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table, { Td } from 'components/Table'
import Button from 'components/Button'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'

import fetcher from 'lib/fetcher'
import { getAllNetworks } from 'lib/swap'

import { SwapRuleModal } from './components'

const hides = ['rules', 'gas', 'initiators', 'marks']
export default function RulesMatrix () {
  const router = useRouter()

  const networks = getAllNetworks()
  const { data, error, mutate } = useSWR('admin/rules?type=network', fetcher)
  const [modalData, setModalData] = React.useState()

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'network', width: '10%', className: 'pl-4 md:pl-6' },
        {
          name: (
            <div className='flex flex-row'>
              <div className='flex-1 shrink-0'>from</div>
              <div className='flex-[2] shrink-0 font-normal text-gray-300'>factor</div>
              <div className='flex-[2] shrink-0 font-normal text-gray-300'>min</div>
              <div className='flex-[2] shrink-0 font-normal text-gray-300'>limit</div>
            </div>
          ),
          width: '30%'
        },
        {
          name: (
            <div className='flex flex-row'>
              <div className='flex-1 shrink-0'>to</div>
              <div className='flex-[2] shrink-0 font-normal text-gray-300'>factor</div>
              <div className='flex-[2] shrink-0 font-normal text-gray-300'>min</div>
              <div className='flex-[2] shrink-0 font-normal text-gray-300'>limit</div>
            </div>
          ),
          width: '30%'
        },
        { name: 'gas', width: '30%' },
      ]}>
        {networks.map((n, i) => <RowSwapRule key={i} network={n} index={i} rules={data} onOpenModal={setModalData} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Fee Rules'
        tabs={[
          { key: 'gas', name: 'Gas', onClick: () => router.push(`/rules/gas`) },
          { key: 'token', name: 'Token', onClick: () => router.push(`/rules/token`) },
          { key: 'address', name: 'Address', onClick: () => router.push(`/rules/address`) },
          { key: 'matrix', name: 'Matrix', active: true },
        ]}
      />
      <CardBody>{body}</CardBody>
      <SwapRuleModal
        type='network'
        hides={hides}
        data={modalData}
        onClose={refresh => {
          setModalData()
          refresh && mutate()
        }}
      />
    </Card>
  )
}

const tokens = ['stablecoins', 'eth', 'btc', 'bnb']
function RowSwapRule ({ network, index, rules, onOpenModal }) {
  const tokensForNetwork = React.useMemo(() => {
    const ts = network.tokens.map(t => MesonClient.tokenType(t.tokenIndex))
    return tokens.filter(t => ts.includes(t))
  }, [network])

  const fromRule = React.useMemo(() => {
    const stablecoins = getRule(rules, { from: network.id, to: '*', priority: 1000 + index * 10 })
    const eth = getRule(rules, { from: `${network.id}:ETH`, to: '*:ETH', priority: 1000 + index * 10 + 1 })
    const btc = getRule(rules, { from: `${network.id}:BTC`, to: '*:BTC', priority: 1000 + index * 10 + 2 })
    const bnb = getRule(rules, { from: `${network.id}:BNB`, to: '*:BNB', priority: 1000 + index * 10 + 3 })
    return { stablecoins, eth, btc, bnb }
  }, [network, index, rules])

  const toRule = React.useMemo(() => {
    const stablecoins = getRule(rules, { to: network.id, from: '*', priority: 1000 + index * 10 + 5 })
    const eth = getRule(rules, { to: `${network.id}:ETH`, from: '*:ETH', priority: 1000 + index * 10 + 6 })
    const btc = getRule(rules, { to: `${network.id}:BTC`, from: '*:BTC', priority: 1000 + index * 10 + 7 })
    const bnb = getRule(rules, { to: `${network.id}:BNB`, from: '*:BNB', priority: 1000 + index * 10 + 8 })
    return { stablecoins, eth, btc, bnb }
  }, [network, index, rules])

  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1'>
        <TagNetwork size='md' network={network} />
      </Td>
      <Td size='sm'>
        <div className='flex flex-col gap-1'>
          {tokensForNetwork.map(t => (
            <div key={t} className='flex flex-row items-center'>
              <div className='flex-1 shrink-0'>
                <TagNetworkToken token={{ symbol: t.toUpperCase() }} iconOnly />
              </div>
              <RuleItem rule={fromRule[t]} onOpenModal={onOpenModal} />
            </div>
          ))}
        </div>
      </Td>
      <Td size='sm'>
        <div className='flex flex-col gap-1'>
          {tokensForNetwork.map(t => (
            <div key={t} className='flex flex-row items-center'>
              <div className='flex-1 shrink-0'>
                <TagNetworkToken token={{ symbol: t.toUpperCase() }} iconOnly />
              </div>
              <RuleItem rule={toRule[t]} onOpenModal={onOpenModal} />
            </div>
          ))}
        </div>
      </Td>
      <Td size='sm'>
        <div className='flex flex-col gap-1'>
          {tokensForNetwork.map(t => (
            <div key={t} className='flex flex-row items-center'>
              <div className='flex-1 shrink-0'>
                <TagNetworkToken token={{ symbol: t.toUpperCase() }} iconOnly />
              </div>
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

function RuleItem ({ rule, onOpenModal }) {
  const commonClassname = 'group flex flex-row flex-[6] shrink-0 leading-4 hover:text-primary hover:underline cursor-pointer'

  if (!rule || !(rule.factor || rule.minimum || rule.limit)) {
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
      <div className={classnames('flex-1 shrink-0 group-hover:text-primary', rule.factor === 1 && 'text-gray-500')}>
        {rule.factor && `${(10000 - rule.factor * 10000)/10}${rule.factor < 1 ? '‰' : ''}`}
      </div>
      <div className='flex-1 shrink-0'>
        {rule.minimum && utils.formatUnits(rule.minimum, 6)}
      </div>
      <div className={classnames('flex-1 shrink-0 group-hover:text-primary', rule.limit === 0 && 'text-red-500')}>
        {rule.limit}
      </div>
    </div>
  )
}
