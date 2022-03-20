import React from 'react'
import Link from 'next/link'
import { ethers } from 'ethers'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, getSwapDuration } from '../lib/swap'

import { Td } from './Table'
import SwapStatusBadge from './SwapStatusBadge'

import TagNetwork from './TagNetwork'
import TagNetworkToken from './TagNetworkToken'

export default function SwapRow({ swap }) {
  const [events, setEvents] = React.useState(swap?.events || [])
  const [recipient, setRecipient] = React.useState(swap?.recipient)

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  const expired = new Date(swap.expireTs) < Date.now()

  React.useEffect(() => {
    if (!from || !to || events.filter(e => !e.name.endsWith(':FAILED')).find(e =>
      ['RELEASED', 'CANCELLED'].includes(e.name) || (expired && e.name === 'REQUESTING')
    )) {
      return
    }

    const swapUpdateListener = updates => {
      if (updates.status) {
        // setStatus(updates.status)
        // TODO
      }
      if (updates.recipient) {
        setRecipient(updates.recipient)
      }
    }

    return socket.subscribe(swap._id, swapUpdateListener)
  }, [swap._id, from, to, events, expired])

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
      <Td><SwapStatusBadge events={events} expired={expired} /></Td>
      <Td>
        <TagNetwork network={from} address={swap.initiator} />
        <div className='text-normal hover:underline hover:text-primary hidden lg:block'>
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator)}</Link>
        </div>
        <div className='text-normal hover:underline hover:text-primary lg:hidden'>
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator, 6, 4)}</Link>
        </div>
      </Td>
      <Td>
        <TagNetwork network={to} address={recipient} />
        <div className='text-normal hover:underline hover:text-primary hidden lg:block'>
          <Link href={`/address/${recipient}`}>{recipient ? abbreviate(recipient) : ''}</Link>
        </div>
        <div className='text-normal hover:underline hover:text-primary lg:hidden'>
          <Link href={`/address/${recipient}`}>{recipient ? abbreviate(recipient, 6, 4) : ''}</Link>
        </div>
      </Td>
      <Td>
        <div className='flex md:flex-col'>
          <div className='mr-1'>
            {ethers.utils.formatUnits(swap.amount, 6)}
          </div>
          <div className='flex items-center'>
            <TagNetworkToken explorer={from.explorer} token={from.token} />
            <div className='hidden md:flex'>
              <div className='text-gray-500 mx-1 text-xs'>{'->'}</div>
              <TagNetworkToken explorer={to.explorer} token={to.token} />
            </div>
          </div>
        </div>
      </Td>
      <Td>
        <div className='flex items-center md:flex-col md:items-start'>
          <div className='mr-1'>{ethers.utils.formatUnits(swap.fee, 6)}</div>
          <TagNetworkToken explorer={from.explorer} token={from.token} />
        </div>
      </Td>
      <Td className='hidden md:table-cell'>
        <span className='text-gray-500'>{getSwapDuration(swap)}</span>
      </Td>
    </tr>
  )
}
