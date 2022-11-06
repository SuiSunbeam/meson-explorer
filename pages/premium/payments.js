import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { presets, abbreviate, formatDate, getExplorerTxLink } from 'lib/swap'

import PagiCard from 'components/Pagi/PagiCard'
import { Td } from 'components/Table'
import ExternalLink from 'components/ExternalLink'
import Badge from 'components/Badge'
import AmountDisplay from 'components/AmountDisplay'

export default function PaymentList() {
  const router = useRouter()

  return (
    <PagiCard
      title='Premiums'
      tabs={[
        { key: 'payment', name: 'Payments', active: true },
        { key: 'stats', name: 'Daily Stats', onClick: () => router.push('/premium/stats') },
        { key: 'redeem', name: 'Redeems', onClick: () => router.push('/premium/redeem') },
        { key: 'giveaway', name: 'Give Aways', onClick: () => router.push('/premium/give-away') }
      ]}
      queryUrl='admin/premium'
      fallback='/premium'
      tableHeaders={[
        { name: 'initiator / time', width: '18%' },
        { name: 'type', width: '8%' },
        { name: 'tx hash', width: '18%' },
        { name: 'paid', width: '8%' },
        { name: 'usage', width: '15%' },
        { name: 'hide', width: '8%' },
        { name: 'valid', width: '25%' }
      ]}
      Row={PaidPremiumRow}
    />
  )
}

export function PaidPremiumRow ({ data, linkPrefix = 'premium' }) {
  const { initiator, hash, paid, used, quota, since, until, hide, meta } = data
  let type = 'BUY'
  let badgeType = 'info'
  if (!meta) {
    type = 'REDEEM'
    badgeType = 'info'
  } else if (!since) {
    type = 'EXTRA'
    badgeType = 'warning'
  } else if (since > meta.ts) {
    type = 'RENEW'
    badgeType = 'success'
  }
  const network = meta && presets.getNetwork(meta.network)
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        <div className='text-primary hover:underline'>
          <Link href={`/${linkPrefix}/${initiator}`}>{abbreviate(initiator, 8, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date((meta ? meta.ts : since) * 1000).toLocaleString()}
        </div>
      </Td>
      <Td><Badge type={badgeType}>{type}</Badge></Td>
      <Td>
      {
        meta &&
        <ExternalLink size='md' className='text-black' href={getExplorerTxLink(network, hash)}>
          {abbreviate(hash, 8, 6)}
        </ExternalLink>
      }
      </Td>
      <Td>
      {
        paid &&
        <>
          <div>$<AmountDisplay value={paid} /></div>
          <div className='text-xs text-gray-500'>{network?.name || meta.network}</div>
        </>
      }
      </Td>
      <Td>
      {
        type === 'EXTRA' 
          ? <div>+{paid / 20000 + 0.5}k</div>
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