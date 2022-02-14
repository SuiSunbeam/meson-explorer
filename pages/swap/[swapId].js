import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { ethers } from 'ethers'

import socket from '../../lib/socket'
import { parseNetworkAndToken, badgeClassnames, getSwapDuration } from '../../lib/swap'

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
      <div className='shadow overflow-hidden border-b border-gray-200 rounded-lg'>
        <div className='bg-white px-4 py-5 sm:px-6'>
          <div className='flex items-center'>
            <span className='text-xl leading-6 font-medium text-gray-900'>Swap</span>
            <span className='ml-2 px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-600'>
              ERROR
            </span>
          </div>
          <p className='mt-1 max-w-2xl text-gray-500'>{swapId}</p>
        </div>
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
    return (
      <div className='flex items-center justify-center mt-6'>
        <svg className='animate-spin h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      </div>
    )
  }
  return <CorrectSwap swapId={swapId} swap={data} />
}

function CorrectSwap({ swapId, swap }) {
  const [status, setStatus] = React.useState(swap.status)
  const [recipient, setRecipient] = React.useState(swap.recipient)

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
    <div className='shadow overflow-hidden border-b border-gray-200 rounded-lg'>
      <div className='bg-white px-4 py-5 sm:px-6'>
        <div className='flex items-center'>
          <span className='text-xl leading-6 font-medium text-gray-900'>Swap</span>
          <span className={classnames(
            'ml-2 px-2 inline-flex text-sm leading-5 font-semibold rounded-full',
            badgeClassnames(status)
          )}>
            {status}
          </span>
        </div>
        <p className='mt-1 max-w-2xl text-gray-500'>{swapId}</p>
      </div>
      <div className='border-t border-gray-200'>
        <dl>
          <ListRow bg title='Requested'>
            {new Date(swap.created).toLocaleString()}
          </ListRow>
          <ListRow title='From'>
            <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
              <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank' rel='noreferrer'>
                {swap.initiator}
              </a>
            </div>
            <div className="text-sm text-gray-500">{from.networkName}</div>
          </ListRow>
          <ListRow bg title='To'>
            <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
              <a href={`${to.explorer}/address/${recipient}`} target='_blank' rel='noreferrer'>
                {recipient}
              </a>
            </div>
            <div className="text-sm text-gray-500">{to.networkName}</div>
          </ListRow>
          <ListRow title='Amount'>
            {ethers.utils.formatUnits(swap.amount, 6)}{' '}
            <a
              className='text-sm hover:text-indigo-500 hover:underline '
              href={`${from.explorer}/token/${from.token.addr}`}
              target='_blank'
              rel='noreferrer'
            >
              {from.token.symbol}
            </a>
            <span className='text-sm text-gray-500'>{' -> '}</span>
            <a
              className='text-sm hover:text-indigo-500 hover:underline '
              href={`${to.explorer}/token/${to.token.addr}`}
              target='_blank'
              rel='noreferrer'
            >
              {to.token.symbol}
            </a>
          </ListRow>
          <ListRow bg title='Fee'>
            {ethers.utils.formatUnits(swap.fee, 6)}{' '}
            <span className='text-sm'>{from.token.symbol}</span>
          </ListRow>
          <SwapTimes status={status} swap={swap} />
        </dl>
      </div>
    </div>
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

