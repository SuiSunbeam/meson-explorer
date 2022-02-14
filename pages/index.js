import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ethers } from 'ethers'
import useSWR from 'swr'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, badgeClassnames, getSwapDuration } from '../lib/swap'
import Pagination from '../components/Pagination'

const fetcher = (...args) => fetch(...args)
  .then(res => res.json())
  .then(json => {
    if (json.result) {
      return json.result
    } else {
      throw new Error(json.error.message)
    }
  })

export default function SwapList() {
  const router = useRouter()
  const page = Number(router.query.page || 1) - 1

  React.useEffect(() => {
    if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
      router.replace('/')
    }
  }, [page])
  if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
    return null
  }

  const { data, error } = useSWR(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/swap?page=${page}`, fetcher)

  if (error) {
    return <p>{error.message}</p>
  }
  if (!data) {
    return (
      <div className='flex items-center justify-center mt-6'>
        <svg className='animate-spin h-5 w-5 text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>
      </div>
    )
  }

  const { total, list } = data
  const onPageChange = page => {
    router.push(`/?page=${page+1}`)
  }
  return (
    <div className='shadow overflow-hidden border-b border-gray-200 rounded-lg'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>swap id / time</th>
            <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>status</th>
            <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>from</th>
            <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>to</th>
            <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>amount</th>
            <th scope='col' className='p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>duration</th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {list.map(swap => <SwapRow key={swap._id} swap={swap} />)}
        </tbody>
      </table>
      <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
    </div>
  )
}


function SwapRow({ swap }) {
  const [status, setStatus] = React.useState(swap.status)
  const [recipient, setRecipient] = React.useState(swap.recipient)

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)

  React.useEffect(() => {
    if (!from || !to || swap.status === 'DONE') {
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

    return socket.subscribe(swap._id, swapUpdateListener)
  }, [swap._id])

  if (!from || !to) {
    return null
  }

  return (
    <tr>
      <td className='px-3 py-4 whitespace-nowrap'>
        <Link href={`/swap/${swap._id}`}>
          <a className='text-indigo-600 hover:text-indigo-500 hover:underline'>
            {abbreviate(swap._id, 8, 8)}
          </a>
        </Link>
        <div className="text-sm text-gray-500">
          {new Date(swap.created).toLocaleString()}
        </div>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className={classnames(
          'px-2 inline-flex text-sm leading-5 font-semibold rounded-full',
          badgeClassnames(status)
        )}>
          {status}
        </span>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
          <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank' rel='noreferrer'>
            {abbreviate(swap.initiator)}
          </a>
        </div>
        <div className="text-sm text-gray-500">{from.networkName}</div>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <div className='text-indigo-600 hover:text-indigo-500 hover:underline'>
          <a href={`${to.explorer}/address/${recipient}`} target='_blank' rel='noreferrer'>
            {recipient ? abbreviate(recipient) : ''}
          </a>
        </div>
        <div className="text-sm text-gray-500">{to.networkName}</div>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <div className='text-gray-900'>
          {ethers.utils.formatUnits(swap.amount, 6)}{' '}
          <a
            className='text-sm text-gray-900 hover:text-indigo-500 hover:underline'
            href={`${from.explorer}/token/${from.token.addr}`}
            target='_blank'
            rel='noreferrer'
          >
            {from.token.symbol}
          </a>
          <span className='text-sm text-gray-500'>{' -> '}</span>
          <a
            className='text-sm text-gray-900 hover:text-indigo-500 hover:underline'
            href={`${to.explorer}/token/${to.token.addr}`}
            target='_blank'
            rel='noreferrer'
          >
            {to.token.symbol}
          </a>
        </div>
        <div className="text-sm text-gray-500">Fee: {ethers.utils.formatUnits(swap.fee, 6)} {from.token.symbol}</div>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <span className='text-gray-900'>
          {getSwapDuration(swap)}
        </span>
      </td>
    </tr>
  )
}
