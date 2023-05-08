import React from 'react'
import { useRouter } from 'next/router'

import PagiCard from 'components/Pagi/PagiCard'
import SwapRow from 'components/SwapRow'
import { presets } from 'lib/swap'

export default function ConflictSwapList() {
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
  const queryUrl = `swap/conflict` + (queryUrlParam && `?${queryUrlParam}`)

  return (
    <PagiCard
      title='Conflict Swaps'
      subtitle='Swaps that only executed or only released'
      tabs={[
        { key: 'bonded', name: 'Bonded', onClick: () => router.push('/pending/bonded') },
        { key: 'locked', name: 'Locked', onClick: () => router.push('/pending/locked') },
        { key: 'conflict', name: 'Conflict', active: true },
        { key: 'double', name: 'Double', onClick: () => router.push('/pending/double') },
        { key: 'dup-hash', name: 'Dup Hash', onClick: () => router.push('/pending/dup-hash') }
      ]}
      queryUrl={queryUrl}
      fallback='/pending/conflict'
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
