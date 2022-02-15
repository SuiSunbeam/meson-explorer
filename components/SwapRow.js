import React from 'react'
import classnames from 'classnames'
import Link from 'next/link'
import { ethers } from 'ethers'
import { ExternalLinkIcon } from '@heroicons/react/outline'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, badgeClassnames, getSwapDuration } from '../lib/swap'

export default function SwapRow({ swap }) {
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
      <td className='pl-4 sm:pl-6 pr-3 py-4 whitespace-nowrap'>
        <div className="text-indigo-600 hover:text-indigo-500 hover:underline">
          <Link href={`/swap/${swap._id}`}>{abbreviate(swap._id, 8, 8)}</Link>
        </div>
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
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator)}</Link>
        </div>
        <div className="text-sm text-gray-500">
          {from.networkName}
          <a href={`${from.explorer}/address/${swap.initiator}`} target='_blank' rel='noreferrer'>
            <ExternalLinkIcon className='inline-block ml-1 w-4 hover:text-indigo-500' aria-hidden='true' />
          </a>
        </div>
      </td>
      <td className='px-3 py-4 whitespace-nowrap'>
        <div className='text-indigo-600 hover:text-indigo-500 hover:underline'>
          <Link href={`/address/${recipient}`}>{recipient ? abbreviate(recipient) : ''}</Link>
        </div>
        <div className="text-sm text-gray-500">
          {to.networkName}
          {
            recipient &&
            <a href={`${to.explorer}/address/${recipient}`} target='_blank' rel='noreferrer'>
              <ExternalLinkIcon className='inline-block ml-1 w-4 hover:text-indigo-500' aria-hidden='true' />
            </a>
          }
        </div>
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
