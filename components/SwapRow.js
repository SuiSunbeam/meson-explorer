import React from 'react'
import Link from 'next/link'
import { ethers } from 'ethers'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, badgeType, getSwapDuration } from '../lib/swap'

import { Td } from './Table'
import Badge from './Badge'
import { ExternalIcon, ExternalToken } from './ExternalLink'

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
      <Td className='pl-4 pr-3 sm:pl-6'>
        <div className='text-primary hover:underline'>
          <Link href={`/swap/${swap._id}`}>{abbreviate(swap._id, 8, 8)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(swap.created).toLocaleString()}
        </div>
      </Td>
      <Td>
        <Badge type={badgeType(status)}>{status}</Badge>
      </Td>
      <Td>
        <div className='text-primary hover:underline'>
          <Link href={`/address/${swap.initiator}`}>{abbreviate(swap.initiator)}</Link>
        </div>
        <div className='flex items-center text-xs text-gray-500'>
          {from.networkName}
          <ExternalIcon href={`${from.explorer}/address/${swap.initiator}`} />
        </div>
      </Td>
      <Td>
        <div className='text-primary hover:underline'>
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
      <Td>{getSwapDuration(swap)}</Td>
    </tr>
  )
}
