import React from 'react'
import classnames from 'classnames'

import { RefreshIcon } from '@heroicons/react/solid'
import { BigNumber, ethers } from 'ethers'

import { Loading } from 'components/LoadingScreen'
import ListRow, { ListRowWrapper } from 'components/ListRow'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'
import ExternalLink from 'components/ExternalLink'
import NumberDisplay from 'components/NumberDisplay'

import fetcher from 'lib/fetcher'
import { getAllNetworks, getExplorerAddressLink } from 'lib/swap'

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

export function LpContent ({ address, addressByNetwork, dealer }) {
  const [totalDeposit, setTotalDeposit] = React.useState(BigNumber.from(0))
  const [totalBalance, setTotalBalance] = React.useState(BigNumber.from(0))
  const [totalSrFeeCollected, setTotalSrFeeCollected] = React.useState(BigNumber.from(0))

  React.useEffect(() => {
    setTotalDeposit(BigNumber.from(0))
    setTotalBalance(BigNumber.from(0))
    setTotalSrFeeCollected(BigNumber.from(0))
  }, [address])

  const add = React.useMemo(() => ({
    toDeposit: delta => setTotalDeposit(v => v.add(delta)),
    toBalance: delta => setTotalBalance(v => v.add(delta)),
    toSrFee: delta => setTotalSrFeeCollected(v => v.add(delta)),
  }), [setTotalDeposit, setTotalBalance])

  const networkRows = React.useMemo(() => {
    if (address) {
      return getAllNetworks()
        .filter(n => (
          (address.length === 66 && ['aptos', 'sui'].find(prefix => n.id.startsWith(prefix))) ||
          (address.length === 42 && !['aptos', 'sui'].find(prefix => n.id.startsWith(prefix)))
        ))
        .map(n => <LpContentRow key={n.id} address={address} dealer={dealer} network={n} add={add} />)
    } else {
      const defaultAddress = addressByNetwork.default
      const keys = Object.keys(addressByNetwork)
      const networkRowsByType = Object.fromEntries(keys.map(k => [k, []]))
      networkRowsByType.default = []
      getAllNetworks().forEach(n => {
        const matchKey = keys.find(k => n.id.startsWith(k))
        if (matchKey) {
          networkRowsByType[matchKey].push(
            <LpContentRow key={n.id} withSrFee address={addressByNetwork[matchKey]} dealer={dealer} network={n} add={add} />
          )
        } else {
          networkRowsByType.default.push(
            <LpContentRow key={n.id} withSrFee address={defaultAddress} dealer={dealer} network={n} add={add} />
          )
        }
      })
      return keys
        .map(k => [
          <ListRowWrapper key={k} size='sm'>
            <div className='col-span-3 text-gray-500'>
              <div className='font-medium text-sm'>{k[0].toUpperCase()}{k.substring(1)}</div>
              <div className='truncate text-sm'>{addressByNetwork[k]}</div>
            </div>
          </ListRowWrapper>,
          ...networkRowsByType[k]
        ])
        .flat()
    }
  }, [address, addressByNetwork, dealer, add])

  return (
    <dl className={!address && 'min-w-[440px]'}>
      <ListRow size='sm' title='Total'>
        <div className='flex items-center'>
          <div className='flex flex-1 flex-col'>
            <div className='text-xs font-medium text-gray-500 uppercase'>Pool Balance</div>
            <NumberDisplay value={ethers.utils.formatUnits(totalDeposit, 6)} />
          </div>
          <div className='flex flex-1 flex-col'>
            <div className='text-xs font-medium text-gray-500 uppercase'>Address Balance</div>
            <NumberDisplay value={ethers.utils.formatUnits(totalBalance, 6)} />
          </div>
          {
            !address &&
            <div className='flex flex-1 flex-col'>
              <div className='text-xs font-medium text-gray-500 uppercase'>Fee Collected</div>
              <NumberDisplay value={ethers.utils.formatUnits(totalSrFeeCollected, 6)} />
            </div>
          }
        </div>
      </ListRow>
      {networkRows}
    </dl>
  )
}

function LpContentRow ({ withSrFee, address, dealer, network, add }) {
  const [core, setCore] = React.useState(<Loading />)

  const mesonClient = React.useMemo(() => {
    return dealer._createMesonClient({
      id: network.id,
      url: network.url.replace('${INFURA_API_KEY}', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID)
    })
  }, [dealer, network])

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
          withSrFee={withSrFee}
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

function TokenAmount ({ withSrFee, mesonClient, address, token, explorer, add }) {
  const [deposit, setDeposit] = React.useState()
  const [balance, setBalance] = React.useState()
  const [srFeeCollected, setSrFeeCollected] = React.useState()

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
    
    if (withSrFee) {
      mesonClient.mesonInstance.serviceFeeCollected(token.tokenIndex, { from: address })
        .catch(() => {})
        .then(v => {
          if (v) {
            if (token.tokenIndex !== 32) {
              add.toSrFee(v)
            }
            setSrFeeCollected(ethers.utils.formatUnits(v, 6))
          }
        })
    }
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
            className={(token.gray || token.disabled) ? 'text-gray-300' : classnames(
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
            className={classnames((balance < 1 || token.disabled) && 'text-gray-300')}
          />
          <TagNetworkToken explorer={explorer} token={token} iconOnly />
        </div>
      </div>

      {
        withSrFee &&
        <div className='flex flex-1 items-center h-5'>
          <div className={classnames(
            'flex items-center relative',
            token.disabled && 'after:block after:absolute after:w-full after:h-0.5 after:bg-gray-500'
          )}>
            <NumberDisplay
              value={srFeeCollected}
              className={classnames((srFeeCollected < 1 || token.disabled) && 'text-gray-300')}
            />
            <TagNetworkToken explorer={explorer} token={token} iconOnly />
          </div>
        </div>
      }
    </div>
  )
}
