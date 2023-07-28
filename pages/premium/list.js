import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { presets, abbreviate, formatDate, getExplorerTxLink } from 'lib/swap'

import PagiCard from 'components/Pagi/PagiCard'
import { Td } from 'components/Table'
import ExternalLink from 'components/ExternalLink'
import Badge from 'components/Badge'
import TagNetwork from 'components/TagNetwork'
import AmountDisplay from 'components/AmountDisplay'

export default function PremiumList() {
  const router = useRouter()

  return (
    <PagiCard
      title='Premiums'
      tabs={[
        { key: 'stats', name: 'Daily Stats', onClick: () => router.push('/premium') },
        { key: 'list', name: 'List', active: true },
        { key: 'redeem', name: 'Redeems', onClick: () => router.push('/premium/redeem') },
        { key: 'giveaway', name: 'Give Aways', onClick: () => router.push('/premium/give-away') }
      ]}
      queryUrl='admin/premium'
      fallback='/premium/list'
      tableHeaders={[
        { name: 'address / period', width: '20%' },
        { name: 'plan', width: '10%' },
        { name: 'usage / quota', width: '20%' },
        { name: 'paid', width: '15%' },
        { name: 'saved', width: '15%' },
        { name: 'txs', width: '20%' },
      ]}
      Row={PaidPremiumRow}
    />
  )
}

export function PaidPremiumRow ({ data, linkPrefix = 'premium' }) {
  const { fromAddress, since, until, plan, used, quota, paid, saved, txs = [] } = data
  let badgeText = 'PREMIUM'
  let badgeType = 'info'
  if (plan === 'premium-plus') {
    badgeText = 'PLUS'
    badgeType = 'success'
  } else if (plan.startsWith('premium-lite-')) {
    badgeText = 'LITE'
    badgeType = 'default'
  }
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-2'>
        <div className='text-primary hover:underline'>
          <Link href={`/${linkPrefix}/${fromAddress}`}>{abbreviate(fromAddress, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {formatDate(since * 1000)} - {formatDate(until * 1000)}
        </div>
      </Td>
      <Td><Badge type={badgeType}>{badgeText}</Badge></Td>
      <Td>
        <div>{Math.floor(used / 1000_000000)}k / {quota / 1000_000000}k</div>
        <div className='text-xs text-gray-500'>{Math.floor(used / quota * 1000) / 10}%</div>
      </Td>
      <Td>
        <div>$<AmountDisplay value={paid} /></div>
      </Td>
      <Td>
        <div>$<AmountDisplay value={saved} /></div>
      </Td>
      <Td>
      {
        txs.map(tx => {
          const network = presets.getNetwork(tx.network)
          return (
            <div key={tx.hash} className='flex items-center'>
              {network && <TagNetwork iconOnly network={network} />}
              <ExternalLink size='md' className='ml-1' href={getExplorerTxLink(network, tx.hash)}>
                {abbreviate(tx.hash, 6)}
              </ExternalLink>
            </div>
          )
        })
      }
      </Td>
    </tr>
  )
}