import React from 'react'
import Link from 'next/link'
import { ethers } from 'ethers'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, getSwapStatus, getSwapDuration } from '../lib/swap'

import { Td } from './Table'
import SwapStatusBadge from './SwapStatusBadge'
import ExternalLink, { ExternalIcon } from './ExternalLink'

export default function SwapRow({ swap }) {
  const statusFromEvents = getSwapStatus(swap.events)
  const [status, setStatus] = React.useState(statusFromEvents)
  const [recipient, setRecipient] = React.useState(swap.recipient)

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  const expired = new Date(swap.expireTs) < Date.now()

  React.useEffect(() => {
    if (!from || !to || ['RELEASED', 'CANCELLED'].includes(statusFromEvents) || (expired && statusFromEvents === 'REQUESTING')) {
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
  }, [swap._id, from, to, statusFromEvents, expired])

  if (!from || !to) {
    return null
  }

  return (
    <tr>
      <Td className='pl-4 pr-3 sm:pl-6'>
        <div className='text-primary hover:underline hidden lg:block'>
          <Link href={`/swap/${swap._id}`}>{abbreviate(swap._id, 8, 8)}</Link>
        </div>
        <div className='text-primary hover:underline lg:hidden'>
          <Link href={`/swap/${swap._id}`}>{abbreviate(swap._id, 6, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(swap.created).toLocaleString()}
        </div>
      </Td>
      <Td><SwapStatusBadge status={status} expired={expired} /></Td>
      <Td>
        <div className='flex items-center text-xs text-gray-500'>
          {from.networkName}
          <ExternalIcon href={`${from.explorer}/address/${swap.initiator}`} />
        </div>
        <div className='text-normal hover:underline hover:text-primary hidden lg:block'>
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator)}</Link>
        </div>
        <div className='text-normal hover:underline hover:text-primary lg:hidden'>
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator, 6, 4)}</Link>
        </div>
      </Td>
      <Td>
        <div className='flex items-center text-xs text-gray-500'>
          {to.networkName}
          {recipient && <ExternalIcon href={`${to.explorer}/address/${recipient}`} />}
        </div>
        <div className='text-normal hover:underline hover:text-primary hidden lg:block'>
          <Link href={`/address/${recipient}`}>{recipient ? abbreviate(recipient) : ''}</Link>
        </div>
        <div className='text-normal hover:underline hover:text-primary lg:hidden'>
          <Link href={`/address/${recipient}`}>{recipient ? abbreviate(recipient, 6, 4) : ''}</Link>
        </div>
      </Td>
      <Td>
        <div className='text-normal'>
          {ethers.utils.formatUnits(swap.amount, 6)}{' '}
          <ExternalLink href={`${from.explorer}/token/${from.token.addr}`}>{from.token.symbol}</ExternalLink>
          <span className='hidden md:inline'>
            <span className='text-sm text-gray-500'>{' -> '}</span>
            <ExternalLink href={`${to.explorer}/token/${to.token.addr}`}>{to.token.symbol}</ExternalLink>
          </span>
        </div>
        <div className='text-xs text-gray-500'>Fee: {ethers.utils.formatUnits(swap.fee, 6)} {from.token.symbol}</div>
      </Td>
      <Td className='hidden md:table-cell'>
        <span className='text-gray-500'>{getSwapDuration(swap)}</span>
      </Td>
    </tr>
  )
}
