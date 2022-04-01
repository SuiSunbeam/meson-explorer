import React from 'react'
import Link from 'next/link'
import { ethers } from 'ethers'
import { Swap } from '@mesonfi/sdk'

import socket from '../lib/socket'
import { parseNetworkAndToken, abbreviate, getDuration } from '../lib/swap'

import { Td } from './Table'
import SwapStatusBadge from './SwapStatusBadge'

import TagNetwork from './TagNetwork'
import TagNetworkToken from './TagNetworkToken'

export default function SwapRow({ data: raw }) {
  const [data, setData] = React.useState(raw)
  React.useEffect(() => { setData(raw) }, [raw])

  let swap
  try {
    swap = Swap.decode(data.encoded)
  } catch {}
  const from = parseNetworkAndToken(swap?.inChain, swap?.inToken)
  const to = parseNetworkAndToken(swap?.outChain, swap?.outToken)
  const expired = swap?.expireTs < Date.now() / 1000

  const swapUpdateListener = ({ status, data } = {}) => {
    setData(prev => {
      const updates = {}
      if (!data.hash || !prev.events.find(e => e.hash === data.hash)) {
        updates.events = [...prev.events, { name: status, ...data }]
      }
      if (!data.failed) {
        if (status === 'RELEASED') {
          updates.released = data.ts * 1000
        } else if (status === 'EXECUTED') {
          updates.executed = data.ts * 1000
        }
        if (data.provider) {
          updates.provider = data.provider
        } else if (data.provider) {
          updates.recipient = data.recipient
        }
      }
      if (Object.keys(updates).length) {
        return { ...prev, ...updates }
      }
      return prev
    })
  }

  const swapId = data?._id
  const noSubscribe = !from || !to || (data.released && data.events.find(e => e.name === 'EXECUTED'))
  React.useEffect(() => {
    if (!swapId || noSubscribe) {
      return
    }
    return socket.subscribe(swapId, swapUpdateListener)
  }, [swapId, noSubscribe])

  if (!from || !to) {
    return null
  }

  const fromAddress = data.fromAddress || data.initiator
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td className='pl-4 pr-3 sm:pl-6'>
        <div className='text-primary hover:underline hidden lg:block'>
          <Link href={`/swap/${swapId}`}>{abbreviate(swapId, 8, 8)}</Link>
        </div>
        <div className='text-primary hover:underline lg:hidden'>
          <Link href={`/swap/${swapId}`}>{abbreviate(swapId, 6, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(data.created).toLocaleString()}
        </div>
      </Td>
      <Td><SwapStatusBadge events={data.events} expired={expired} /></Td>
      <Td>
        <TagNetwork network={from} address={fromAddress} />
        <div className='text-normal hover:underline hover:text-primary hidden lg:block'>
          <Link href={`/address/${fromAddress}`}>{abbreviate(fromAddress)}</Link>
        </div>
        <div className='text-normal hover:underline hover:text-primary lg:hidden'>
          <Link href={`/address/${fromAddress}`}>{abbreviate(fromAddress, 6, 4)}</Link>
        </div>
      </Td>
      <Td>
        <TagNetwork network={to} address={data.recipient} />
        <div className='text-normal hover:underline hover:text-primary hidden lg:block'>
          <Link href={`/address/${data.recipient}`}>{abbreviate(data.recipient)}</Link>
        </div>
        <div className='text-normal hover:underline hover:text-primary lg:hidden'>
          <Link href={`/address/${data.recipient}`}>{abbreviate(data.recipient, 6, 4)}</Link>
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
        <span className='text-gray-500'>
          {getDuration(data.created, data.released)}
        </span>
      </Td>
    </tr>
  )
}
