import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { ethers } from 'ethers'

import socket from '../../lib/socket'
import { parseNetworkAndToken, getSwapStatus, sortEvents, getSwapDuration } from '../../lib/swap'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'
import SwapStatusBadge from '../../components/SwapStatusBadge'
import { ExternalIcon, ExternalLinkXs } from '../../components/ExternalLink'

const fetcher = async swapId => {
  if (!swapId) {
    throw new Error('No swap id')
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/swap/${swapId}`)
  if (res.status >= 400) {
    throw new Error('Swap not found')
  }
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

export default function Swap() {
  const router = useRouter()
  const swapId = router.query.swapId
  const { data, error } = useSWR(swapId, fetcher)

  if (error) {
    return (
      <Card>
        <CardTitle
          title='Swap'
          badge={<SwapStatusBadge status='ERROR' />}
          subtitle={swapId}
        />
        <CardBody>
          <dl>
            <ListRow bg title='Reason'>
              {error.message}
            </ListRow>
          </dl>
        </CardBody>
      </Card>
    )
  } else if (!data) {
    return <LoadingScreen />
  }
  return <CorrectSwap swapId={swapId} swap={data} />
}

function CorrectSwap({ swapId, swap }) {
  const statusFromEvents = getSwapStatus(swap.events)
  const [status, setStatus] = React.useState(statusFromEvents)
  const [recipient, setRecipient] = React.useState(swap.recipient || '')

  React.useEffect(() => {
    if (statusFromEvents === 'RELEASED') {
      return
    }

    const swapUpdateListener = updates => {
      if (updates.status) {
        setStatus(updates.status)
      }
      if (updates.recipient) {
        setRecipient(updates.recipient)
      }
    }

    return socket.subscribe(swapId, swapUpdateListener)
  }, [swapId, statusFromEvents])

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  if (!from || !to) {
    return null
  }
  const expired = new Date(swap.expireTs) < Date.now()

  return (
    <Card>
      <CardTitle
        title='Swap'
        badge={<SwapStatusBadge status={status} expired={expired} />}
        subtitle={swapId}
      />
      <CardBody>
        <dl>
          <ListRow bg title='Encoded As'>
            {swap.encoded}
          </ListRow>
          <ListRow title='From'>
            <div className='text-primary hover:underline'>
              <Link href={`/address/${swap.initiator}`}>{swap.initiator}</Link>
            </div>
            <div className='flex items-center text-sm text-gray-500'>
              {from.networkName}
              <ExternalIcon href={`${from.explorer}/address/${swap.initiator}`} />
            </div>
          </ListRow>
          <ListRow bg title='To'>
            <div className='text-primary hover:underline'>
              <Link href={`/address/${swap.initiator}`}>{recipient}</Link>
            </div>
            <div className='flex items-center text-sm text-gray-500'>
              {to.networkName}
              {recipient && <ExternalIcon href={`${to.explorer}/address/${recipient}`} />}
            </div>
          </ListRow>
          <ListRow title='Amount'>
            {ethers.utils.formatUnits(swap.amount, 6)}{' '}
            <ExternalLinkXs href={`${from.explorer}/token/${from.token.addr}`}>{from.token.symbol}</ExternalLinkXs>
            <span className='text-sm text-gray-500'>{' -> '}</span>
            <ExternalLinkXs href={`${to.explorer}/token/${to.token.addr}`}>{to.token.symbol}</ExternalLinkXs>
          </ListRow>
          <ListRow bg title='Fee'>
            {ethers.utils.formatUnits(swap.fee, 6)}{' '}
            <ExternalLinkXs href={`${from.explorer}/token/${from.token.addr}`}>{from.token.symbol}</ExternalLinkXs>
          </ListRow>
          <ListRow title='Requested at'>
            {new Date(swap.created).toLocaleString()}
          </ListRow>
          <SwapTimes status={status} expired={expired} swap={swap} />

          <ListRow bg={status === 'RELEASED'} title='Process'>
            <ul role='list' className='border border-gray-200 rounded-md divide-y divide-gray-200 bg-white'>
              {sortEvents(swap.events).map((e, index) => (
                <li key={`process-${index}`} className='pl-3 pr-4 py-3 flex items-center justify-between'>
                  <div className='w-0 flex-1 flex items-center'>
                    <span className='ml-2 flex-1 w-0 text-sm capitalize truncate'>{e.name.toLowerCase()}</span>
                  </div>
                  <div className='ml-4 flex-shrink-0'>
                    <ExternalLinkXs href={`${e.index === 3 || e.index === 5 ? to.explorer : from.explorer}/tx/${e.hash}`}>{e.hash}</ExternalLinkXs>
                  </div>
                </li>
              ))}
            </ul>
          </ListRow>
        </dl>
      </CardBody>
    </Card>
  )
}

function SwapTimes({ status, expired, swap }) {
  if (status === 'RELEASED') {
    return (
      <>
        <ListRow bg title='Finished at'>{new Date(swap.released).toLocaleString()}</ListRow>
        <ListRow title='Duration'>{getSwapDuration(swap)}</ListRow>
      </>
    )
  }
  return (
    <ListRow bg title={expired ? 'Expired at' : 'Will expire at'}>
      {new Date(swap.expireTs).toLocaleString()}
    </ListRow>
  )
}

function ListRow({ bg, title, children }) {
  return (
    <div className={classnames(
      'px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6',
      bg ? 'bg-gray-50' : 'bg-white'
    )}>
      <dt className='text-sm font-medium text-gray-500 uppercase'>{title}</dt>
      <dd className='mt-1 text-gray-900 sm:mt-0 sm:col-span-2'>
        {children}
      </dd>
    </div>
  )
}

