import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { XCircleIcon } from '@heroicons/react/solid'
import useSWR from 'swr'
import { ethers } from 'ethers'
import { Swap } from '@mesonfi/sdk'

import AppContext from 'lib/context'
import fetcher from 'lib/fetcher'
import socket from 'lib/socket'
import { parseNetworkAndToken, sortEvents, getStatusFromEvents, getDuration } from 'lib/swap'
import extensions from 'lib/extensions'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Button from 'components/Button'
import SwapStatusBadge from 'components/SwapStatusBadge'
import ListRow from 'components/ListRow'
import ExternalLink from 'components/ExternalLink'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'

export default function SwapDetail() {
  const router = useRouter()
  const idOrEncoded = router.query.idOrEncoded
  const { data, error } = useSWR(`swap/${idOrEncoded}`, fetcher)

  if (error) {
    return (
      <Card>
        <CardTitle
          title='Swap'
          badge={<SwapStatusBadge error />}
          subtitle={idOrEncoded}
        />
        <CardBody border={false}>
          <dl>
            <ListRow title='Reason'>
              {error.message}
            </ListRow>
          </dl>
        </CardBody>
      </Card>
    )
  }

  return <CorrectSwap data={data} />
}

function CorrectSwap({ data: raw }) {
  const { globalState, setGlobalState } = React.useContext(AppContext)
  const { currentAccount } = globalState.browserExt || {}
  const connectedAddress = currentAccount?.hex

  const [data, setData] = React.useState(raw)
  React.useEffect(() => { setData(raw) }, [raw])

  const swapUpdateListener = ({ status, data } = {}) => {
    setData(prev => {
      const updates = {}
      if (!data.hash || !prev.events.find(e => e.hash === data.hash)) {
        updates.events = [...prev.events, { name: status, ...data }]
      }
      if (!data.failed) {
        if (status === 'RELEASED') {
          updates.released = data.ts * 1000
        } else if (status === 'EXECUTED') {
          updates.executed = data.ts * 1000
        }
        if (data.provider) {
          updates.provider = data.provider
        } else if (data.provider) {
          updates.fromTo = [prev.fromTo[0], data.recipient]
        }
      }
      if (Object.keys(updates).length) {
        return { ...prev, ...updates }
      }
      return prev
    })
  }

  const noSubscribe = !data || (data.released && data.executed)
  React.useEffect(() => {
    if (noSubscribe) {
      return
    }
    return socket.subscribe(data._id, swapUpdateListener)
  }, [data?._id, noSubscribe])


  let body
  let swap
  try {
    swap = Swap.decode(data?.encoded)
  } catch {}

  if (!data) {
    body = <LoadingScreen />
  } else {
    const from = parseNetworkAndToken(swap?.inChain, swap?.inToken)
    const to = parseNetworkAndToken(swap?.outChain, swap?.outToken)

    if (!from || !to) {
      body = ''
    } else {
      const fromAddress = data.fromTo[0] || data.initiator
      const recipient = data.fromTo[1] || ''

      let inAmount = ethers.utils.formatUnits(swap.amount, swap.inToken === 255 ? 4 : 6)
      let outAmount = ethers.utils.formatUnits(swap.amount.sub(swap.totalFee), 6)
      if (swap.deprecatedEncoding) {
        inAmount = ethers.utils.formatUnits(swap.amount.add(swap.fee), swap.inToken === 255 ? 4 : 6)
        outAmount = ethers.utils.formatUnits(swap.amount, 6)
      }
      body = (
        <dl>
          <ListRow title='Encoded As'>
            <div className='break-all'>{data.encoded}</div>
          </ListRow>
          <ListRow title='From'>
            <TagNetwork network={from} address={fromAddress} />
            <div className='text-normal truncate'>
              <span className='hover:underline hover:text-primary'>
                <Link href={`/address/${fromAddress}`}>{fromAddress}</Link>
              </span>
            </div>
          </ListRow>
          <ListRow title='To'>
            <TagNetwork network={to} address={recipient} />
            <div className='text-normal truncate'>
              <span className='hover:underline hover:text-primary'>
                <Link href={`/address/${recipient}`}>{recipient}</Link>
              </span>
            </div>
          </ListRow>
          <ListRow title='Amount'>
            <div className='flex items-center'>
              <div className='mr-1'>{inAmount}</div>
              <TagNetworkToken explorer={from.explorer} token={from.token} />
              <div className='text-sm text-gray-500 mx-1'>{'->'}</div>
              <div className='mr-1'>{outAmount}</div>
              <TagNetworkToken explorer={to.explorer} token={to.token} />
            </div>
          </ListRow>
          <ListRow title='Fee'>
            <div className='flex items-center'>
              <div className='mr-1'>{ethers.utils.formatUnits(swap.totalFee, 6)}</div>
              <TagNetworkToken
                explorer={swap.deprecatedEncoding ? from.explorer : to.explorer}
                token={swap.deprecatedEncoding ? from.token : to.token}
              />
            </div>
            <div className={classnames('text-sm text-gray-500', swap.totalFee.gt(0) ? '' : 'hidden')}>
              {ethers.utils.formatUnits(swap.platformFee, 6)} Platform fee + {ethers.utils.formatUnits(swap.fee, 6)} LP fee
            </div>
          </ListRow>
          <ListRow title='Requested at'>
            {new Date(data.created).toLocaleString()}
          </ListRow>
          {data.provider && <ListRow title='Provider'><div className='truncate'>{data.provider}</div></ListRow>}
          <SwapTimes data={data} expired={expired} expireTs={swap.expireTs} />

          <ListRow title='Process'>
            <ul role='list' className='border border-gray-200 rounded-md divide-y divide-gray-200 bg-white'>
              {sortEvents(data?.events).map((e, index) => (
                <li key={`process-${index}`}>
                  <div className='lg:grid lg:grid-cols-4 sm:px-4 sm:py-3 px-3 py-2 text-sm'>
                    <div><SwapStepName {...e} /></div>
                    <div className='lg:col-span-3 lg:flex lg:flex-row lg:justify-end'>
                      <div className='max-w-full truncate text-gray-500'>
                        <SwapStepInfo {...e} fromAddress={fromAddress} from={from} to={to} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ListRow>
        </dl>
      )
    }
  }

  const expired = swap?.expireTs < Date.now() / 1000
  return (
    <Card>
      <CardTitle
        title='Swap'
        badge={<SwapStatusBadge events={data?.events || []} expired={expired} />}
        subtitle={data?._id}
        right={<SwapActionButton data={data} swap={swap} show={connectedAddress} setGlobalState={setGlobalState} />}
      />
      <CardBody border={!data}>
        {body}
      </CardBody>
    </Card>
  )
}

function SwapActionButton({ data, swap, show, setGlobalState }) {
  let empty
  if (!show || !data || (data.released && data.executed)) {
    empty = true
  }

  const expired = swap?.expireTs < Date.now() / 1000
  let status = getStatusFromEvents(data?.events || [], expired)

  React.useEffect(() => {
    if (swap?.inChain && swap?.outChain) {
      if (status === 'BONDED' || status === 'EXPIRED*' || status === 'CANCELLED*' || status === 'RELEASING*') {
        setGlobalState(prev => ({ ...prev, coinType: swap?.outChain }))
      } else if (status === 'REQUESTING' || status === 'EXPIRED' || status === 'RELEASED') {
        setGlobalState(prev => ({ ...prev, coinType: swap?.inChain }))
      } else {
        setGlobalState(prev => ({ ...prev, coinType: '' }))
      }
    }
  }, [setGlobalState, status, swap?.inChain, swap?.outChain])

  if (empty) {
    return null
  }

  const initiator = data.initiator || data.fromTo[0]
  const recipient = data.fromTo[1]
  switch (status) {
    case 'REQUESTING':
      return <Button size='sm' color='info' rounded onClick={() => extensions.bond(swap, data.signature, initiator)}>Bond</Button>
    case 'BONDED':
      return <Button size='sm' color='info' rounded onClick={() => extensions.lock(swap, data.signature, initiator)}>Lock</Button>
    case 'EXPIRED*':
    case 'CANCELLED*':
      return <Button size='sm' color='info' rounded onClick={() => extensions.unlock(swap, initiator)}>Unlock</Button>
    case 'EXPIRED':
      return <Button size='sm' color='info' rounded onClick={() => extensions.withdraw(swap)}>Withdraw</Button>
    case 'RELEASED':
      return <Button size='sm' color='info' rounded onClick={() => extensions.execute(swap, data.releaseSignature, recipient)}>Execute</Button>
    case 'RELEASING*':
      return <Button size='sm' color='info' rounded onClick={() => extensions.release(swap, data.releaseSignature, initiator, recipient)}>Release</Button>
  }
  return null
}

function SwapStepName({ index, name }) {
  if (index === 0) {
    return 'Request by'
  } else if (index === 5) {
    return 'Release to'
  } else {
    return <span className='capitalize'>{name.split(':')[0].toLowerCase()}</span>
  }
}

function SwapStepInfo({ index, hash, recipient, name, fromAddress, from, to }) {
  if (index === 0) {
    return <ExternalLink size='sm' href={`${from.explorer}/address/${fromAddress}`}>{fromAddress}</ExternalLink>
  } else if (index === 5) {
    return <ExternalLink size='sm' href={`${to.explorer}/address/${recipient}`}>{recipient}</ExternalLink>
  }
  return (
    <div className='flex items-center'>
      {name.endsWith(':FAILED') && <FailedIcon />}
      <div className='truncate'>
        <ExternalLink size='sm' href={`${[3, 4, 7].includes(index) ? to.explorerTx : from.explorerTx}/${hash}`}>{hash}</ExternalLink>
      </div>
    </div>
  )
}

function FailedIcon() {
  return <div className='text-red-400 w-4 mr-1'><XCircleIcon className='w-4' aria-hidden='true' /></div>
}

function SwapTimes({ data, expired, expireTs }) {
  if (data.released) {
    return (
      <>
        <ListRow title='Finished at'>{new Date(data.released).toLocaleString()}</ListRow>
        <ListRow title='Duration'>{getDuration(data.created, data.released)}</ListRow>
      </>
    )
  }
  return (
    <ListRow title={expired ? 'Expired at' : 'Will expire at'}>
      {new Date(expireTs * 1000).toLocaleString()}
    </ListRow>
  )
}
