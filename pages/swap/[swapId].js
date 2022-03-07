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
import ListRow from '../../components/ListRow'
import ExternalLink, { ExternalIcon } from '../../components/ExternalLink'

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
  }
  
  return <CorrectSwap swapId={swapId} swap={data} />
}

function CorrectSwap({ swapId, swap }) {
  const statusFromEvents = getSwapStatus(swap?.events || [])
  const [status, setStatus] = React.useState(statusFromEvents)
  const [recipient, setRecipient] = React.useState(swap?.recipient || '')
  const expired = new Date(swap?.expireTs) < Date.now()

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

  let body
  if (!swap) {
    body = <LoadingScreen />
  } else {
    const from = parseNetworkAndToken(swap.inChain, swap.inToken)
    const to = parseNetworkAndToken(swap.outChain, swap.outToken)
    if (!from || !to) {
      body = ''
    } else {
      body = (
        <dl>
          <ListRow bg title='Encoded As'>
            <div className='truncate'>{swap.encoded}</div>
          </ListRow>
          <ListRow title='From'>
            <div className='text-normal hover:underline hover:text-primary'>
              <Link href={`/address/${swap.initiator}`}>{swap.initiator}</Link>
            </div>
            <div className='flex items-center text-sm text-gray-500'>
              {from.networkName}
              <ExternalIcon href={`${from.explorer}/address/${swap.initiator}`} />
            </div>
          </ListRow>
          <ListRow bg title='To'>
            <div className='text-normal hover:underline hover:text-primary'>
              <Link href={`/address/${swap.initiator}`}>{recipient}</Link>
            </div>
            <div className='flex items-center text-sm text-gray-500'>
              {to.networkName}
              {recipient && <ExternalIcon href={`${to.explorer}/address/${recipient}`} />}
            </div>
          </ListRow>
          <ListRow title='Amount'>
            {ethers.utils.formatUnits(swap.amount, 6)}{' '}
            <ExternalLink href={`${from.explorer}/token/${from.token.addr}`}>{from.token.symbol}</ExternalLink>
            <span className='text-sm text-gray-500'>{' -> '}</span>
            <ExternalLink href={`${to.explorer}/token/${to.token.addr}`}>{to.token.symbol}</ExternalLink>
          </ListRow>
          <ListRow bg title='Fee'>
            {ethers.utils.formatUnits(swap.fee, 6)}{' '}
            <ExternalLink href={`${from.explorer}/token/${from.token.addr}`}>{from.token.symbol}</ExternalLink>
          </ListRow>
          <ListRow title='Requested at'>
            {new Date(swap.created).toLocaleString()}
          </ListRow>
          <SwapTimes status={status} expired={expired} swap={swap} />

          <ListRow bg={status === 'RELEASED'} title='Process'>
            <ul role='list' className='border border-gray-200 rounded-md divide-y divide-gray-200 bg-white'>
              {sortEvents(swap.events).map((e, index) => (
                <li key={`process-${index}`}>
                  <div className='lg:grid lg:grid-cols-4 sm:px-4 sm:py-3 px-3 py-2 text-sm'>
                    <div><SwapStepName {...e} /></div>
                    <div className='lg:col-span-3 lg:flex lg:flex-row lg:justify-end'>
                      <div className='max-w-full truncate text-gray-500'>
                        <SwapStepInfo {...e} initiator={swap.initiator} from={from} to={to} />
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

  return (
    <Card>
      <CardTitle
        title='Swap'
        badge={<SwapStatusBadge status={status} expired={expired} />}
        subtitle={swapId}
      />
      <CardBody border={!swap}>
        {body}
      </CardBody>
    </Card>
  )
}

function SwapStepName({ index, name }) {
  if (index === 0) {
    return 'Request by'
  } else if (index === 4) {
    return 'Release to'
  } else {
    return <span className='capitalize'>{name.toLowerCase()}</span>
  }
}

function SwapStepInfo({ index, hash, recipient, initiator, from, to }) {
  if (index === 0) {
    return <ExternalLink size='sm' href={`${from.explorer}/address/${initiator}`}>{initiator}</ExternalLink>
  } else if (index === 4) {
    return <ExternalLink size='sm' href={`${to.explorer}/address/${recipient}`}>{recipient}</ExternalLink>
  }
  return (
    <ExternalLink size='sm' href={`${index === 3 || index === 5 ? to.explorer : from.explorer}/tx/${hash}`}>{hash}</ExternalLink>
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
