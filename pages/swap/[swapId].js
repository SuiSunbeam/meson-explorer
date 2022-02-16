import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import socket from '../../lib/socket'
import { parseNetworkAndToken, badgeType, getSwapDuration } from '../../lib/swap'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'

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
      <div className='overflow-hidden border-b border-gray-200 rounded-lg shadow'>
        <CardTitle
          title='Swap'
          badge='ERROR'
          badgeType='error'
          subtitle={swapId}
        />
        <div className='border-t border-gray-200'>
          <dl>
            <ListRow bg title='Reason'>
              {error.message}
            </ListRow>
          </dl>
        </div>
      </div>
    )
  } else if (!data) {
    return <LoadingScreen />
  }
  return <CorrectSwap swapId={swapId} swap={data} />
}

function CorrectSwap({ swapId, swap }) {
  const [status, setStatus] = React.useState(swap.status)
  const [recipient, setRecipient] = React.useState(swap.recipient || '')

  React.useEffect(() => {
    if (swap.status === 'DONE') {
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
  }, [swapId])

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  if (!from || !to) {
    return null
  }

  return (
    <Card>
      <CardTitle
        title='Swap'
        badge={status}
        badgeType={badgeType(status)}
        subtitle={swapId}
      />
      <CardBody>
        <dl>
          <ListRow bg title='From'>
            <div className="text-primary hover:underline">
              <Link href={`/address/${swap.initiator}`}>
                {swap.initiator}
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              {from.networkName}
              <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank' rel='noreferrer'>
                <ExternalLinkIcon className='inline-block w-4 ml-1 hover:text-primary' aria-hidden='true' />
              </a>
            </div>
          </ListRow>
          <ListRow title='To'>
            <div className="text-primary hover:underline">
              <Link href={`/address/${swap.initiator}`}>
                {recipient}
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              {to.networkName}
              {
                recipient &&
                <a href={`${to.explorer}/address/${recipient}`} target='_blank' rel='noreferrer'>
                  <ExternalLinkIcon className='inline-block w-4 ml-1 hover:text-primary' aria-hidden='true' />
                </a>
              }
            </div>
          </ListRow>
          <ListRow bg title='Amount'>
            {ethers.utils.formatUnits(swap.amount, 6)}{' '}
            <a
              className='text-sm hover:text-primary hover:underline '
              href={`${from.explorer}/token/${from.token.addr}`}
              target='_blank'
              rel='noreferrer'
            >
              {from.token.symbol}
            </a>
            <span className='text-sm text-gray-500'>{' -> '}</span>
            <a
              className='text-sm hover:text-primary hover:underline '
              href={`${to.explorer}/token/${to.token.addr}`}
              target='_blank'
              rel='noreferrer'
            >
              {to.token.symbol}
            </a>
          </ListRow>
          <ListRow title='Fee'>
            {ethers.utils.formatUnits(swap.fee, 6)}{' '}
            <span className='text-sm'>{from.token.symbol}</span>
          </ListRow>
          <ListRow bg title='Requested'>
            {new Date(swap.created).toLocaleString()}
          </ListRow>
          <SwapTimes status={status} swap={swap} />
        </dl>
      </CardBody>
    </Card>
  )
}

function SwapTimes({ status, swap }) {
  if (status === 'DONE') {
    return (
      <>
        <ListRow title='Finished'>
          {new Date(swap.done).toLocaleString()}
        </ListRow>
        <ListRow bg title='Duration'>
          {getSwapDuration(swap)}
        </ListRow>
      </>
    )
  }
  return (
    <ListRow title='Will expire'>
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

