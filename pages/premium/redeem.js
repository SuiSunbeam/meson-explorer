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
        { key: 'stats', name: 'Daily Stats', onClick: () => router.push('/premium') },
        { key: 'payment', name: 'Payments', onClick: () => router.push('/premium/payments') },
        { key: 'redeem', name: 'Redeems', active: true },
        { key: 'giveaway', name: 'Give Aways', onClick: () => router.push('/premium/give-away') }
      ]}
      queryUrl='admin/premium/redeem'
      fallback='/premium/redeem'
      tableHeaders={[
        { name: 'initiator / time', width: '30%' },
        { name: 'type', width: '15%' },
        { name: 'usage', width: '15%' },
        { name: 'hide', width: '10%' },
        { name: 'valid', width: '30%' }
      ]}
      Row={RedeemedPremiumRow}
    />
  )
}

function RedeemedPremiumRow ({ data }) {
  const { initiator, paid, used, quota, since, until, hide } = data
  const type = 'REDEEM'
  const badgeType = 'info'
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        <div className='text-primary hover:underline'>
          <Link href={`/premium/${initiator}`}>{abbreviate(initiator, 6)}</Link>
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
      <Td><Badge type={hide ? 'info' : ''}>{hide ? 'HIDE' : ''}</Badge></Td>
      <Td>{type !== 'EXTRA' && `${formatDate(since * 1000)} - ${formatDate(until * 1000)}`}</Td>
    </tr>
  )
}