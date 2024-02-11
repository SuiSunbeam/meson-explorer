import React from 'react'
import useSWR from 'swr'
import { ethers } from 'ethers'

import fetcher from 'lib/fetcher'
import { formatDuration } from 'lib/swap'
import { StatCard } from 'components/Card'
import { Td } from 'components/Table'

const fmt = Intl.NumberFormat()

export function GeneralStats() {
  const { data: generalData } = useSWR(`stats/general`, fetcher)

  const { success, count, volume, duration, addresses } = generalData || {}
  const nSuccess = success ? fmt.format(success) : '-'
  const nTotal = count ? fmt.format(count) : '-'
  const rate = (success > 1 && count > 1) ? <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span> : ''

  return (
    <div className='grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-3 md:mb-5 mb-3'>
      <StatCard title='# of Swaps' value={<>{nSuccess} / {nTotal} {rate}</>} />
      <StatCard title='# of Addresses' value={addresses || 'N/A'} />
      <StatCard title='Total Volume' value={volume ? `$${fmt.format(Math.floor(ethers.utils.formatUnits(volume, 6)))}` : 'N/A'} />
      <StatCard title='Avg. Duration' value={duration ? formatDuration(duration * 1000) : 'N/A'} />
    </div>
  )
}

export function StatTableRow({ data, token }) {
  const { _id: date, count, success, api, auto, m2, a2, volume = 0, srFee, lpFee, addresses, duration } = data
  const volumeStr = valueInStr(volume, token)
  const srFeeStr = valueInStr(srFee, token, true)
  const lpFeeStr = valueInStr(lpFee, token, true)
  const avgSwapAmount = success ? valueInStr(Math.floor(volume / success), token) : ''

  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm'>{date}</Td>
      <Td size='sm'><SwapCount count={count} success={success} /></Td>
      <Td size='sm'><SwapCount {...api} /></Td>
      <Td size='sm'><SwapCount {...auto} /></Td>
      <Td size='sm'><SwapCount {...m2} /></Td>
      {/* <Td size='sm'><SwapCount {...a2} /></Td> */}
      <Td size='sm'>{addresses}</Td>
      {
        token &&
        <>
          <Td size='sm'>{volumeStr}</Td>
          <Td size='sm'>{srFeeStr} <span className='text-gray-500'>|</span> {lpFeeStr}</Td>
          <Td size='sm'>{avgSwapAmount}</Td>
        </>
      }
      <Td size='sm'>{formatDuration(duration * 1000)}</Td>
    </tr>
  )
}

export function valueInStr (value = 0, symbol, k = false) {
  if (symbol === 'eth') {
    return `${fmt.format(ethers.utils.formatUnits(value, 6))}🔹`
  } else if (symbol === 'btc') {
    return <div className='inline-flex items-center'>{fmt.format(ethers.utils.formatUnits(value, 6))}<span className='text-[80%] ml-0.5'>🫓</span></div>
  } else if (symbol === 'bnb') {
    return `${fmt.format(ethers.utils.formatUnits(value, 6))}🔸`
  }
  const amount = Math.floor(ethers.utils.formatUnits(value, 6))
  if (k && amount > 10000) {
    return `$${Math.floor(amount / 1000)}k`
  }
  return `$${fmt.format(amount)}`
}

function SwapCount({ count, success }) {
  if (!count) {
    return null
  }
  const countStr = count > 100000 ? Math.floor(count / 1000) + 'k' : count
  const successStr = success > 100000 ? Math.floor(success / 1000) + 'k' : success
  return <>{successStr} <span className='text-gray-500'>/</span> {countStr} <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span></>
}
