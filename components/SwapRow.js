import React from 'react'
import Link from 'next/link'
import { ethers } from 'ethers'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, getSwapDuration } from '../lib/swap'

import { Td } from './Table'
import SwapStatusBadge from './SwapStatusBadge'
import { ExternalIcon, ExternalToken } from './ExternalLink'

export default function SwapRow({ swap }) {
  const [status, setStatus] = React.useState(swap.status)
  const [recipient, setRecipient] = React.useState(swap.recipient)

  const from = parseNetworkAndToken(swap.inChain, swap.inToken)
  const to = parseNetworkAndToken(swap.outChain, swap.outToken)
  const expired = new Date(swap.expireTs) < Date.now()

  React.useEffect(() => {
    if (!from || !to || ['DONE', 'CANCELLED'].includes(swap.status) || (expired && swap.status === 'REQUESTING')) {
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
  }, [swap._id, from, to, swap.status, expired])

  if (!from || !to) {
    return null
  }

  return (
    <tr>
      <Td className='pl-4 pr-3 sm:pl-6'>
        <div className='text-primary hover:underline'>
          <Link href={`/swap/${swap._id}`}>{abbreviate(swap._id, 8, 8)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(swap.created).toLocaleString()}
        </div>
      </Td>
      <Td><SwapStatusBadge status={status} expired={expired} /></Td>
      <Td>
        <div className='text-black hover:underline hover:text-primary'>
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator)}</Link>
        </div>
        <div className='flex items-center text-xs text-gray-500'>
          {from.networkName}
          <ExternalIcon href={`${from.explorer}/address/${swap.initiator}`} />
        </div>
      </Td>
      <Td>
        <div className='text-black hover:underline hover:text-primary'>
          <Link href={`/address/${recipient}`}>{recipient ? abbreviate(recipient) : ''}</Link>
        </div>
        <div className='flex items-center text-xs text-gray-500'>
          {to.networkName}
          {recipient && <ExternalIcon href={`${to.explorer}/address/${recipient}`} />}
        </div>
      </Td>
      <Td>
        <div className='text-black'>
          {ethers.utils.formatUnits(swap.amount, 6)}{' '}
          <ExternalToken name={from.token.symbol} href={`${from.explorer}/token/${from.token.addr}`} />
          <span className='text-sm text-gray-500'>{' -> '}</span>
          <ExternalToken name={to.token.symbol} href={`${to.explorer}/token/${to.token.addr}`} />
        </div>
        <div className='text-xs text-gray-500'>Fee: {ethers.utils.formatUnits(swap.fee, 6)} {from.token.symbol}</div>
      </Td>
      <Td><span className='text-gray-500'>{getSwapDuration(swap)}</span></Td>
    </tr>
  )
}
