import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { abbreviate, formatDate } from 'lib/swap'

import PagiCard from 'components/Pagi/PagiCard'
import { Td } from 'components/Table'
import Badge from 'components/Badge'

export default function RedeemList() {
  const router = useRouter()

  return (
    <PagiCard
      title='Premiums'
      tabs={[
        { key: 'payment', name: 'Payments', onClick: () => router.push('/premium') },
        { key: 'redeem', name: 'Redeems', active: true },
        { key: 'daily', name: 'Daily Stats', onClick: () => router.push('/premium/daily') }
      ]}
      queryUrl='premium/redeem'
      fallback='/premium/redeem'
      tableHeaders={[
        { name: 'initiator / time', width: '30%' },
        { name: 'type', width: '20%' },
        { name: 'usage', width: '20%' },
        { name: 'valid', width: '30%' }
      ]}
      Row={RedeemedPremiumRow}
    />
  )
}

function RedeemedPremiumRow ({ data }) {
  const { initiator, paid, used, quota, since, until } = data
  const type = 'REDEEM'
  const badgeType = 'info'
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        <div className='text-primary hover:underline'>
          <Link href={`/premium/${initiator}`}>{abbreviate(initiator, 8, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(since * 1000).toLocaleString()}
        </div>
      </Td>
      <Td><Badge type={badgeType}>{type}</Badge></Td>
      <Td>
      {
        type === 'EXTRA' 
          ? <div>+{paid / 200000 + 0.05}k</div>
          : <>
              <div>{Math.floor(used / 1000_000000)}k / {quota / 1000_000000}k</div>
              <div className='text-xs text-gray-500'>{Math.floor(used/quota*1000)/10}%</div>
            </>
        
      }
      </Td>
      <Td>{type !== 'EXTRA' && `${formatDate(since * 1000)} - ${formatDate(until * 1000)}`}</Td>
    </tr>
  )
}