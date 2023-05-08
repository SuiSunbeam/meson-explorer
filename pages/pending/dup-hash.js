import React from 'react'
import { useRouter } from 'next/router'

import PagiCard from 'components/Pagi/PagiCard'
import SwapRow from 'components/SwapRow'

export default function DoubleReleaseList() {
  const router = useRouter()

  return (
    <PagiCard
      title='Duplicated Hashes'
      subtitle='Swaps that have events with same hashes'
      tabs={[
        { key: 'bonded', name: 'Bonded', onClick: () => router.push('/pending/bonded') },
        { key: 'locked', name: 'Locked', onClick: () => router.push('/pending/locked') },
        { key: 'conflict', name: 'Conflict', onClick: () => router.push('/pending/conflict') },
        { key: 'double', name: 'Double', onClick: () => router.push('/pending/double') },
        { key: 'dup-hash', name: 'Dup Hash', active: true }
      ]}
      queryUrl='swap/dup-hash'
      fallback='/pending/dup-hash'
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
