import React from 'react'
import classnames from 'classnames'

import { useSession } from 'next-auth/react'
import { RefreshIcon } from '@heroicons/react/solid'
import { BigNumber, ethers } from 'ethers'
import { MesonClient } from '@mesonfi/sdk'

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
  const { data: session } = useSession()
  const checkDifference = !address && session?.user?.roles?.some(r => ['root'].includes(r))

  const [totalDeposit, setTotalDeposit] = React.useState({})
  const [totalBalance, setTotalBalance] = React.useState({})
  const [totalSrFeeCollected, setTotalSrFeeCollected] = React.useState({})
  const [totalInContractDiff, setTotalInContractDiff] = React.useState({})

  React.useEffect(() => {
    setTotalDeposit({})
    setTotalBalance({})
    setTotalSrFeeCollected({})
    setTotalInContractDiff({})
  }, [address])

  const add = React.useMemo(() => ({
    toDeposit: (delta, tokenType) => setTotalDeposit(prev => ({ ...prev, [tokenType]: BigNumber.from(prev[tokenType] || 0).add(delta) })),
    toBalance: (delta, tokenType) => setTotalBalance(prev => ({ ...prev, [tokenType]: BigNumber.from(prev[tokenType] || 0).add(delta) })),
    toSrFee: (delta, tokenType) => setTotalSrFeeCollected(prev => ({ ...prev, [tokenType]: BigNumber.from(prev[tokenType] || 0).add(delta) })),
    toInContractDiff: (delta, tokenType) => setTotalInContractDiff(prev => ({ ...prev, [tokenType]: BigNumber.from(prev[tokenType] || 0).add(delta) })),
  }), [])

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
            <LpContentRow key={n.id} address={addressByNetwork[matchKey]} withSrFee checkDifference={checkDifference} dealer={dealer} network={n} add={add} />
          )
        } else {
          networkRowsByType.default.push(
            <LpContentRow key={n.id} address={defaultAddress} withSrFee checkDifference={checkDifference} dealer={dealer} network={n} add={add} />
          )
        }
      })
      return keys
        .map(k => [
          <ListRowWrapper key={k} size='xs'>
            <div className='text-gray-500'>
              <div className='font-medium text-sm'>{k[0].toUpperCase()}{k.substring(1)}</div>
              <div className='truncate text-sm'>{addressByNetwork[k]}</div>
            </div>
          </ListRowWrapper>,
          ...networkRowsByType[k]
        ])
        .flat()
    }
  }, [address, addressByNetwork, checkDifference, dealer, add])

  return (
    <dl className={!address && (checkDifference ? 'min-w-[600px]' : 'min-w-[440px]')}>
      <ListRowWrapper size='sm'>
        <dt className='flex-1'>
          <div className='flex flex-1 flex-col'>
            <div className='text-xs font-medium text-gray-500 uppercase'>Total</div>
            <div className='flex items-center'>
              <NumberDisplay
                className='font-bold'
                value={ethers.utils.formatUnits(BigNumber.from(totalDeposit.eth || 0).add(totalBalance.eth || 0).add(totalSrFeeCollected.eth || 0), 6)}
              />
              <TagNetworkToken token={{ symbol: 'ETH' }} iconOnly />
            </div>
            <div className='flex items-center'>
              <NumberDisplay
                className='font-bold'
                value={ethers.utils.formatUnits(BigNumber.from(totalDeposit.bnb || 0).add(totalBalance.bnb || 0).add(totalSrFeeCollected.bnb || 0), 6)}
              />
              <TagNetworkToken token={{ symbol: 'BNB' }} iconOnly />
            </div>
            <div className='flex items-center'>
              <NumberDisplay
                className='font-bold'
                value={ethers.utils.formatUnits(BigNumber.from(totalDeposit.stablecoins || 0).add(totalBalance.stablecoins || 0).add(totalSrFeeCollected.stablecoins || 0), 6)}
              />
              <TagNetworkToken token={{ symbol: 'USD' }} iconOnly />
            </div>
          </div>
        </dt>
        <dd className='md:flex-[2] mt-1 md:mt-0 md:min-w-[540px]'>
          <div className='flex items-center'>
            <div className='flex flex-1 flex-col'>
              <div className='text-xs font-medium text-gray-500 uppercase'>Pool Balance</div>
              <div className='flex items-center'>
                <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalDeposit.eth || 0), 6)} />
                <TagNetworkToken token={{ symbol: 'ETH' }} iconOnly />
              </div>
              <div className='flex items-center'>
                <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalDeposit.bnb || 0), 6)} />
                <TagNetworkToken token={{ symbol: 'BNB' }} iconOnly />
              </div>
              <div className='flex items-center'>
                <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalDeposit.stablecoins || 0), 6)} />
                <TagNetworkToken token={{ symbol: 'USD' }} iconOnly />
              </div>
            </div>
            <div className='flex flex-1 flex-col'>
              <div className='text-xs font-medium text-gray-500 uppercase'>Balance</div>
              <div className='flex items-center'>
                <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalBalance.eth || 0), 6)} />
                <TagNetworkToken token={{ symbol: 'ETH' }} iconOnly />
              </div>
              <div className='flex items-center'>
                <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalBalance.bnb || 0), 6)} />
                <TagNetworkToken token={{ symbol: 'BNB' }} iconOnly />
              </div>
              <div className='flex items-center'>
                <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalBalance.stablecoins || 0), 6)} />
                <TagNetworkToken token={{ symbol: 'USD' }} iconOnly />
              </div>
            </div>
            {
              !address &&
              <div className='flex flex-1 flex-col'>
                <div className='text-xs font-medium text-gray-500 uppercase'>Fee Collected</div>
                <div className='flex items-center'>
                  <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalSrFeeCollected.eth || 0), 6)} />
                  <TagNetworkToken token={{ symbol: 'ETH' }} iconOnly />
                </div>
                <div className='flex items-center'>
                  <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalSrFeeCollected.bnb || 0), 6)} />
                  <TagNetworkToken token={{ symbol: 'BNB' }} iconOnly />
                </div>
                <div className='flex items-center'>
                  <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalSrFeeCollected.stablecoins || 0), 6)} />
                  <TagNetworkToken token={{ symbol: 'USD' }} iconOnly />
                </div>
              </div>
            }
            {
              !address && checkDifference &&
              <>
                <div className='flex flex-1 flex-col min-w-[142.5px]'>
                  <div className='text-xs font-medium text-gray-500 uppercase'>Difference</div>
                  <div className='flex items-center'>
                    <div className='ml-1 text-sm font-mono'>+</div>
                    <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalInContractDiff.eth || 0), 6)} />
                    <TagNetworkToken token={{ symbol: 'ETH' }} iconOnly />
                  </div>
                  <div className='flex items-center'>
                    <div className='ml-1 text-sm font-mono'>+</div>
                    <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalInContractDiff.bnb || 0), 6)} />
                    <TagNetworkToken token={{ symbol: 'BNB' }} iconOnly />
                  </div>
                  <div className='flex items-center'>
                    <div className='ml-1 text-sm font-mono'>+</div>
                    <NumberDisplay value={ethers.utils.formatUnits(BigNumber.from(totalInContractDiff.stablecoins || 0), 6)} />
                    <TagNetworkToken token={{ symbol: 'USD' }} iconOnly />
                  </div>
                </div>
              </>
            }
          </div>
        </dd>
      </ListRowWrapper>
      {networkRows}
    </dl>
  )
}

function LpContentRow ({ address, withSrFee, checkDifference, dealer, network, add }) {
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

  const alert = CORE_ALERT[network.id] || 0.01
  const tokens = [...network.tokens].sort((t1, t2) => Math.abs(64 - t2.tokenIndex) - Math.abs(64 - t1.tokenIndex))
  if (network.uctAddress) {
    tokens.push({ symbol: 'UCT', addr: network.uctAddress, decimals: 6, tokenIndex: 255, disabled: true })
  }

  const [cursor, setCursor] = React.useState(null)
  const [retrievePage, setRetrievePage] = React.useState('')
  const retrieve = async () => {
    const page = retrievePage || 1
    const txs = await fetcher.post(`admin/retrieve`, { networkId: network.id, page, cursor })
    const nextCursor = txs && txs[txs.length - 1]
    setRetrievePage(page + 1)
    if (nextCursor) {
      setCursor(nextCursor)
    }
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
        <div className='flex flex-row md:flex-col align-start justify-between'>
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
          address={address}
          mesonClient={mesonClient}
          withSrFee={withSrFee}
          checkDifference={checkDifference}
          token={t}
          explorer={network.explorer}
          add={add}
        />
      ))}
    </ListRow>
  )
}

function TokenAmount ({ address, mesonClient, checkDifference, withSrFee, token, explorer, add }) {
  const [deposit, setDeposit] = React.useState()
  const [balance, setBalance] = React.useState()
  const [srFeeCollected, setSrFeeCollected] = React.useState()
  const [inContractDiff, setInContractDiff] = React.useState()

  React.useEffect(() => {
    if (!address) {
      return
    }

    (async function () {
      await mesonClient.ready({ from: address }).catch(() => {})

      const tokenType = MesonClient.tokenType(token.tokenIndex)

      const deposit = await mesonClient.getBalanceInPool(address, token.tokenIndex).catch(() => {})
      if (deposit) {
        if (token.tokenIndex !== 32) {
          add.toDeposit(deposit.value, tokenType)
        }
        setDeposit(deposit.value)
      }
      
      if (token.symbol !== 'UCT') {
        const tokenBalance = await mesonClient.getTokenBalance(address, token.tokenIndex).catch(() => {})
        if (tokenBalance) {
          if (token.tokenIndex !== 32) {
            add.toBalance(tokenBalance.value, tokenType)
          }
          setBalance(tokenBalance.value)
        }
      } else {
        setBalance(BigNumber.from(0))
      }
      
      if (withSrFee) {
        const srFee = await mesonClient.serviceFeeCollected(token.tokenIndex, { from: address }).catch(() => {})
        if (srFee) {
          if (token.tokenIndex !== 32) {
            add.toSrFee(srFee.value, tokenType)
          }
          setSrFeeCollected(srFee.value)
        }
      }
    })()
  }, [address]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!checkDifference || !address || !deposit || !srFeeCollected) {
      return
    }
    (async () => {
      const tokenType = MesonClient.tokenType(token.tokenIndex)
      if (address.length === 66) {
        const diff = await mesonClient.pendingTokenBalance(token.tokenIndex).catch(() => {})
        if (diff) {
          if (token.tokenIndex !== 32) {
            add.toInContractDiff(diff.value, tokenType)
          }
          setInContractDiff(diff.value)
        }
      } else {
        const inContractBalance = await mesonClient.inContractTokenBalance(token.tokenIndex, { from: address }).catch(() => {})
        if (inContractBalance) {
          const diff = inContractBalance.value.sub(deposit).sub(srFeeCollected)
          if (token.tokenIndex !== 32) {
            add.toInContractDiff(diff, tokenType)
          }
          setInContractDiff(diff)
        }
      }
    })()
  }, [address, checkDifference, deposit, srFeeCollected]) // eslint-disable-line react-hooks/exhaustive-deps

  if (token.symbol === 'UCT' && !deposit) {
    return null
  }

  return (
    <div className='flex items-center'>
      <div className='flex flex-1 items-center h-5'>
        <div className={classnames(
          'flex items-center relative',
          token.disabled && 'after:block after:absolute after:w-full after:h-0.5 after:bg-gray-500'
        )}>
          <NumberDisplay
            value={deposit && ethers.utils.formatUnits(deposit, 6)}
            className={getDepositAmountClassName(token, deposit)}
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
            value={balance && ethers.utils.formatUnits(balance, 6)}
            className={getAmountClassName(token, balance)}
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
              value={srFeeCollected && ethers.utils.formatUnits(srFeeCollected, 6)}
              className={getAmountClassName(token, srFeeCollected)}
            />
            <TagNetworkToken explorer={explorer} token={token} iconOnly />
          </div>
        </div>
      }
      {
        checkDifference &&
        <>
          <div className='flex flex-1 items-center h-5'>
            <div className={classnames('ml-1 w-2 text-sm font-mono', token.disabled ? 'text-transparent' : 'text-gray-500')}>+</div>
            <div className={classnames(
              'flex items-center relative',
              token.disabled && 'after:block after:absolute after:w-full after:h-0.5 after:bg-gray-500'
            )}>
              <NumberDisplay
                value={inContractDiff && ethers.utils.formatUnits(inContractDiff, 6)}
                className={getAmountClassName(token, inContractDiff)}
              />
              <TagNetworkToken explorer={explorer} token={token} iconOnly />
            </div>
          </div>
        </>
      }
    </div>
  )
}

function getAmountClassName (token, amount) {
  if (token.disabled) {
    return 'text-gray-300'
  } else if (token.tokenIndex >= 191) {
    return classnames(amount?.lt(1e3) && 'text-gray-300')
  } else {
    return classnames(amount?.lt(1e6) && 'text-gray-300')
  }
}

function getDepositAmountClassName (token, deposit) {
  if (token.disabled) {
    return 'text-gray-300'
  } else if (token.tokenIndex >= 191) {
    return classnames(
      deposit?.lte(1e6) && 'bg-red-500 text-white',
      deposit?.gt(1e6) && deposit?.lte(5e6) && 'text-red-500',
      deposit?.gt(5e6) && deposit?.lte(10e6) && 'text-warning',
      deposit?.gt(10e6) && deposit?.lte(20e6) && 'text-indigo-500'
    )
  } else {
    return classnames(
      deposit?.lte(1000e6) && 'bg-red-500 text-white',
      deposit?.gt(1000e6) && deposit?.lte(5000e6) && 'text-red-500',
      deposit?.gt(5000e6) && deposit?.lte(10000e6) && 'text-warning',
      deposit?.gt(10000e6) && deposit?.lte(20000e6) && 'text-indigo-500'
    )
  }
}
