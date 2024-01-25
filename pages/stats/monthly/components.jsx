import React from 'react'
import { ethers } from 'ethers'

import { Td } from 'components/Table'

const fmt = Intl.NumberFormat()

export function StatTableRow({ data }) {
  const { _id: date, count, api, auto, m2, vol_usd, fee_usd, vol_btc, fee_btc, vol_eth, fee_eth, vol_bnb, fee_bnb, addresses } = data

  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm'>{date}</Td>
      <Td size='xs' className='font-mono text-right'>{fmt.format(count)}</Td>
      <Td size='xs' className='font-mono text-right'>{fmt.format(api)}</Td>
      <Td size='xs' className='font-mono text-right'>{fmt.format(auto)}</Td>
      <Td size='xs' className='font-mono text-right'>{fmt.format(m2)}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(vol_usd)}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(fee_usd)}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(vol_btc, 'btc')}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(fee_btc, 'btc')}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(vol_eth, 'eth')}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(fee_eth, 'eth')}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(vol_bnb, 'bnb')}</Td>
      <Td size='xs' className='font-mono text-right'>{formatVol(fee_bnb, 'bnb')}</Td>
      <Td size='xs' className='pr-4 sm:pr-6 font-mono text-right'>{addresses && fmt.format(addresses)}</Td>
    </tr>
  )
}

export function formatVol (value, symbol) {
  if (!value) {
    return
  }
  if (symbol) {
    return fmt.format(ethers.utils.formatUnits(value, 6))
  }
  const amount = Math.floor(ethers.utils.formatUnits(value, 6))
  return `$${fmt.format(amount)}`
}

