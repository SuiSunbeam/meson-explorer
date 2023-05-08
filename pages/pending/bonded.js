import React from 'react'
import { useRouter } from 'next/router'

import PagiCard from 'components/Pagi/PagiCard'
import SwapRow from 'components/SwapRow'
import { presets } from 'lib/swap'

export default function BondedSwapList() {
  const router = useRouter()

  const { from, to } = router.query
  const queryUrlParamList = []
  if (from) {
    queryUrlParamList.push(`from=${from}`)
  }
  if (to) {
    queryUrlParamList.push(`to=${to}`)
  }
  const queryUrlParam = queryUrlParamList.join('&')
  const queryUrl = `swap/bonded` + (queryUrlParam && `?${queryUrlParam}`)

  return (
    <PagiCard
      title='Bonded Swaps'
      subtitle='Swaps that were bonded but not executed or cancelled'
      tabs={[
        { key: 'bonded', name: 'Bonded', active: true },
        { key: 'locked', name: 'Locked', onClick: () => router.push('/pending/locked') },
        { key: 'conflict', name: 'Conflict', onClick: () => router.push('/pending/conflict') },
        { key: 'double', name: 'Double', onClick: () => router.push('/pending/double') },
        { key: 'dup-hash', name: 'Dup Hash', onClick: () => router.push('/pending/dup-hash') }
      ]}
      queryUrl={queryUrl}
      fallback='/pending/bonded'
      pageSize={20}
      reducer={(prev, item) => (BigInt(Math.round(prev * 1e6)) + BigInt(presets.parseInOutNetworkTokens(item.encoded).swap.amount)).toString() / 1e6}
      tableHeaders={[
        { name: 'swap id / time', width: '18%', className: 'hidden sm:table-cell' },
        { name: 'swap id', width: '18%', className: 'pl-4 sm:hidden' },
        { name: 'status', width: '10%', className: 'hidden sm:table-cell' },
        { name: 'from', width: '18%' },
        { name: 'to', width: '18%' },
        { name: 'amount', width: '18%' },
        { name: 'fee', width: '9%', className: 'hidden md:table-cell' },
        { name: 'duration', width: '9%', className: 'hidden lg:table-cell' }
      ]}
      Row={SwapRow}
    />
  )
}
