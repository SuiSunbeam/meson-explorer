import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import ReconnectingWebSocket from 'reconnecting-websocket'

import { RefreshIcon } from '@heroicons/react/solid'
import { BigNumber, ethers } from 'ethers'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen, { Loading } from 'components/LoadingScreen'
import Button from 'components/Button'
import ListRow from 'components/ListRow'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'
import ExternalLink from 'components/ExternalLink'
import NumberDisplay from 'components/NumberDisplay'

import { LPS } from 'lib/const'
import fetcher from 'lib/fetcher'
import { presets, getAllNetworks, getExplorerAddressLink, abbreviate } from 'lib/swap'

let JsonRpcs = {}
try {
  JsonRpcs = JSON.parse(process.env.NEXT_PUBLIC_JSON_RPCS)
} catch {}

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
  zksync: 0.05,
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

  const restartLp = async () => {
    await fetcher.post(`admin/restart`, { service: 'lp' })
    window.alert('LP service restarted!')
  }

  const restartRelayer = async () => {
    await fetcher.post(`admin/restart`, { service: 'relayer' })
    window.alert('Relayer restarted! LP service will restart after 20 seconds.')
    setTimeout(restartLp, 20000)
  }

  return (
    <Card>
      <CardTitle
        title='Liquidity Providers'
        subtitle={address}
        tabs={[
          ...LPS.map(lp => ({
            key: lp,
            name: abbreviate(lp, 4, 0),
            active: address === lp,
            onClick: () => router.push(`/lp/${lp}`)
          })),
          { key: 'whitelist', name: 'Whitelist', onClick: () => router.push(`/lp/whitelist`) }
        ]}
        right={
          <div className='flex gap-1'>
            <Button size='sm' color='info' rounded onClick={() => restartLp()}>Restart LP</Button>
            <Button size='sm' color='info' rounded onClick={() => restartRelayer()}>Restart Relayer</Button>
          </div>
        }
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
      {
        getAllNetworks()
          .filter(n => (
            (address.length === 66 && n.id.startsWith('aptos')) ||
            (address.length === 42 && !n.id.startsWith('aptos'))
          ))
          .map(n => <LpContentRow key={n.id} address={address} network={n} add={add} />)
      }
    </dl>
  )
}

function LpContentRow ({ address, network, add }) {
  const { id, url } = network
  const [core, setCore] = React.useState(<Loading />)

  const mesonClient = React.useMemo(() => {
    let urls = [url.replace('${INFURA_API_KEY}', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID)]
    if (JsonRpcs[id]) {
      if (typeof JsonRpcs[id] === 'string') {
        urls = JsonRpcs[id].split(';')
      } else if (Array.isArray(JsonRpcs[id])) {
        urls = JsonRpcs[id]
      }
    }
  
    let client
    if (id.startsWith('tron')) {
      client = presets.createNetworkClient({ id, url: urls[0] })
    } else if (id.startsWith('aptos')) {
      client = presets.createNetworkClient({ id, url: urls[0] })
    } else {
      client = presets.createNetworkClient({
        id,
        quorum: {
          threshold: 1,
          list: urls.map((url, index) => {
            if (url.startsWith('ws')) {
              const ws = new ReconnectingWebSocket(url)
              return { ws, priority: index, stallTimeout: 400, weight: 1 }
            } else {
              return { url, priority: index, stallTimeout: 400, weight: 1 }
            }
          })
        }
      })
    }
    return presets.createMesonClient(id, client)
  }, [id, url])

  const nativeDecimals = network.nativeCurrency?.decimals || 18
  React.useEffect(() => {
    if (!address) {
      return
    }
    mesonClient.getBalance(address)
      .catch(err => console.error(err))
      .then(v => {
        if (v) {
          const [i, d] = ethers.utils.formatUnits(v, nativeDecimals).split('.')
          setCore(`${i}.${d.substring(0, 6)}`)
        }
      })
  }, [mesonClient, address, nativeDecimals])

  const alert = CORE_ALERT[network.id]
  const tokens = [...network.tokens]
  if (network.uctAddress) {
    tokens.push({ symbol: 'UCT', addr: network.uctAddress, decimals: 6, gray: true })
  }

  const [retrievePage, setRetrievePage] = React.useState('')
  const retrieve = async () => {
    const page = retrievePage || 1
    setRetrievePage(page + 1)
    await fetcher.post(`admin/retrieve`, { networkId: network.id, page })
  }
  const retrieveButton = (
    <div className='ml-1 flex items-center cursor-pointer hover:text-indigo-500' onClick={retrieve}>
      <RefreshIcon className='w-3.5 h-3.5' aria-hidden='true' />
      <div className='ml-0.5 text-xs'>{retrievePage}</div>
    </div>
  )

  return (
    <ListRow
      size='sm'
      title={
        <div className='flex flex-row sm:flex-col align-start justify-between'>
          <div className='self-start flex flex-row items-center'>
            <ExternalLink
              size='md'
              className='flex flex-row normal-case'
              href={getExplorerAddressLink(network, network.mesonAddress)}
            >
              <TagNetwork size='md' network={network} iconOnly />
              <div className='ml-2 font-medium'>{network.name}</div>
            </ExternalLink>
            {retrieveButton}
          </div>
          <div className={classnames(
            'flex ml-7 mt-0.5 text-xs font-mono',
            core <= alert && 'bg-red-500 text-white',
            core > alert && core <= alert * 3 && 'text-red-500',
            core > alert * 3 && core <= alert * 10 && 'text-warning',
            core > alert * 10 && core <= alert * 20 && 'text-indigo-500',
          )}>
            {core}
            <div className='ml-1'>{network.nativeCurrency?.symbol || 'ETH'}</div>
          </div>
        </div>
      }
    >
      {tokens.map(t => (
        <TokenAmount
          key={t.addr}
          mesonClient={mesonClient}
          address={address}
          token={t}
          explorer={network.explorer}
          add={add}
        />
      ))}
    </ListRow>
  )
}

function TokenAmount ({ mesonClient, address, token, explorer, add }) {
  const [deposit, setDeposit] = React.useState()
  const [balance, setBalance] = React.useState()

  React.useEffect(() => {
    if (!address) {
      return
    }
    mesonClient.poolTokenBalance(token.addr, address, { from: address })
      .catch(() => {})
      .then(v => {
        if (v) {
          if (token.tokenIndex !== 32) {
            add.toDeposit(v)
          }
          setDeposit(ethers.utils.formatUnits(v, 6))
        }
      })
    
    mesonClient.getTokenContract(token.addr).balanceOf(address, { from: address })
      .catch(() => {})
      .then(v => {
        if (v) {
          if (token.tokenIndex !== 32) {
            add.toBalance(v.div(10 ** (token.decimals - 6)))
          }
          setBalance(ethers.utils.formatUnits(v, token.decimals))
        }
      })
  }, [address]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex items-center'>
      <div className='flex flex-1 items-center h-5'>
        <div className={classnames(
          'flex items-center relative',
          token.disabled && 'after:block after:absolute after:w-full after:h-0.5 after:bg-gray-500'
        )}>
          <NumberDisplay
            value={deposit}
            classNames={(token.gray || token.disabled) ? 'text-gray-300' : classnames(
              deposit <= 1000 && 'bg-red-500 text-white',
              deposit > 1000 && deposit <= 5000 && 'text-red-500',
              deposit > 5000 && deposit <= 10000 && 'text-warning',
              deposit > 10000 && deposit <= 20000 && 'text-indigo-500'
            )}
          />
          <TagNetworkToken explorer={explorer} token={token} iconOnly />
        </div>
      </div>

      <div className='flex flex-1 items-center h-5'>
        <div className={classnames(
          'flex items-center relative',
          token.disabled && 'after:block after:absolute after:w-full after:h-0.5 after:bg-gray-500'
        )}>
          <NumberDisplay
            value={balance}
            classNames={classnames((balance < 1 || token.disabled) && 'text-gray-300')}
          />
          <TagNetworkToken explorer={explorer} token={token} iconOnly />
        </div>
      </div>
    </div>
  )
}
