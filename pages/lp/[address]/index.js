import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'

import { BigNumber, ethers } from 'ethers'

import Card, { CardTitle, CardBody } from '../../../components/Card'
import LoadingScreen, { Loading } from '../../../components/LoadingScreen'
import ListRow from '../../../components/ListRow'
import TagNetwork from '../../../components/TagNetwork'
import TagNetworkToken from '../../../components/TagNetworkToken'
import ExternalLink from '../../../components/ExternalLink'

import { presets, getAllNetworks } from '../../../lib/swap'

const CORE_ALERT = {
  eth: 0.01,
  bnb: 0.1,
  polygon: 0.1,
  evmos: 0.001,
  arb: 0.05,
  opt: 0.05,
  aurora: 0.00001,
  cfx: 0.01,
  avax: 0.01,
  ftm: 1,
  tron: 50,
  one: 10,
  movr: 0.05,
  beam: 0.1,
}

export default function LpPage() {
  const router = useRouter()
  const { address } = router.query

  let body = <CardBody><LoadingScreen /></CardBody>
  if (address) {
    body = (
      <CardBody border={false}>
        <LpContent address={address} />
      </CardBody>
    )
  }

  return (
    <Card>
      <CardTitle
        title='LP'
        subtitle={address}
        tabs={[
          { key: 'liquidity', name: 'Liquidity', active: true },
          { key: 'rules', name: 'Swap Rules', onClick: () => router.push(`/lp/${address}/rules`) }
        ]}
      />
      {body}
    </Card>
  )
}

function LpContent ({ address }) {
  const [totalDeposit, setTotalDeposit] = React.useState(BigNumber.from(0))
  const [totalBalance, setTotalBalance] = React.useState(BigNumber.from(0))

  React.useEffect(() => {
    setTotalDeposit(BigNumber.from(0))
    setTotalBalance(BigNumber.from(0))
  }, [address])

  const add = React.useMemo(() => ({
    toDeposit: delta => setTotalDeposit(v => v.add(delta)),
    toBalance: delta => setTotalBalance(v => v.add(delta))
  }), [setTotalDeposit, setTotalBalance])

  return (
    <dl>
      <ListRow size='sm' title='Total'>
        <div className='flex items-center'>
          <div className='flex flex-1 items-center h-5'>
            <NumberDisplay value={ethers.utils.formatUnits(totalDeposit, 6)} />
          </div>
          <div className='flex flex-1 items-center h-5'>
            <NumberDisplay value={ethers.utils.formatUnits(totalBalance, 6)} />
          </div>
        </div>
      </ListRow>
      {getAllNetworks().map(n => (
        <LpContentRow key={n.id} address={address} network={n} add={add} />
      ))}
    </dl>
  )
}

function NumberDisplay ({ value, classNames }) {
  if (!value) {
    return <span className='ml-[100px] mr-[6px]'><Loading /></span>
  }

  const [i, d = ''] = value.split('.')
  return (
    <pre className={classnames('text-sm font-mono mr-1', classNames)}>
      <span>{i.padStart(7, ' ')}</span>
      <span className='opacity-40'>.{d.padEnd(6, '0').substring(0, 6)}</span>
    </pre>
  )
}

function LpContentRow ({ address, network, add }) {
  const [core, setCore] = React.useState(<Loading />)

  const client = presets.clientFromUrl({
    id: network.id,
    url: network.url.replace('${INFURA_API_KEY}', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID)
  })

  let formatedAddress = address
  if (network.id.startsWith('tron')) {
    formatedAddress = client.tronWeb.address.fromHex(address?.replace('0x', '41'))
    if (formatedAddress) {
      client.tronWeb.setAddress(formatedAddress)
    }
  }

  React.useEffect(() => {
    if (!formatedAddress) {
      return
    }
    client.getBalance(formatedAddress)
      .catch(() => {})
      .then(v => {
        if (v) {
          const [i, d] = ethers.utils.formatUnits(v, network.nativeCurrency?.decimals || 18).split('.')
          setCore(`${i}.${d.substring(0, 6)}`)
        }
      })
  }, [formatedAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  const alert = CORE_ALERT[network.id]
  return (
    <ListRow
      size='sm'
      title={
        <div className='flex flex-row sm:flex-col align-start justify-between'>
          <div className='self-start'>
            <ExternalLink size='md' className='flex flex-row normal-case' href={`${network.explorer}/address/${network.mesonAddress}`}>
              <TagNetwork size='md' network={network} iconOnly />
              <div className='ml-2 font-medium'>{network.name}</div>
            </ExternalLink>
          </div>
          <div className={classnames(
            'flex ml-7 mt-0.5 text-xs font-mono',
            core <= alert && 'bg-red-500 text-white',
            core > alert && core <= alert * 3 && 'text-red-500',
            core > alert * 3 && core <= alert * 10 && 'text-yellow-500',
            core > alert * 10 && core <= alert * 20 && 'text-blue-400',
          )}>
            {core}
            <div className='ml-1'>{network.nativeCurrency?.symbol || 'ETH'}</div>
          </div>
        </div>
      }
    >
      {network.tokens.map(t => (
        <TokenAmount
          key={t.addr}
          client={client}
          address={formatedAddress}
          token={t}
          explorer={network.explorer}
          add={add}
        />
      ))}
    </ListRow>
  )
}

function TokenAmount ({ client, address, token, explorer, add }) {
  const [deposit, setDeposit] = React.useState()
  const [balance, setBalance] = React.useState()

  React.useEffect(() => {
    if (!address) {
      return
    }
    client.balanceOf(token.addr, address)
      .catch(() => {})
      .then(v => {
        if (v) {
          add.toDeposit(v)
          setDeposit(ethers.utils.formatUnits(v, 6))
        }
      })
    
    client.balanceOfToken(token.addr, address)
      .catch(() => {})
      .then(v => {
        if (v) {
          add.toBalance(v.div(10 ** (token.decimals - 6)))
          setBalance(ethers.utils.formatUnits(v, token.decimals))
        }
      })
  }, [address]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex items-center'>
      <div className='flex flex-1 items-center h-5'>
        <NumberDisplay
          value={deposit}
          classNames={classnames(
            deposit <= 1000 && 'bg-red-500 text-white',
            deposit > 1000 && deposit <= 5000 && 'text-red-500',
            deposit > 5000 && deposit <= 10000 && 'text-yellow-500',
            deposit > 10000 && deposit <= 20000 && 'text-blue-400'
          )}
        />
        <TagNetworkToken explorer={explorer} token={token} />
      </div>

      <div className='flex flex-1 items-center h-5'>
        <NumberDisplay
          value={balance}
          classNames={classnames(balance < 1 && 'text-gray-300')}
        />
        <TagNetworkToken explorer={explorer} token={token} />
      </div>
    </div>
  )
}
