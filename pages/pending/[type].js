import React from 'react'
import { useRouter } from 'next/router'
import { Swap } from '@mesonfi/sdk'

import PagiCard from 'components/Pagi/PagiCard'
import SwapRow from 'components/SwapRow'
import { Td } from 'components/Table'

const titles = {
  bonded: 'Bonded Swaps',
  locked: 'Locked Swaps',
  'need-release': 'Releasing*',
  'need-execute': 'Released',
  'need-unlock': 'Need Unlock',
  double: 'Double Release',
  'dup-hash': 'Duplicated Hashes',
  'error-confirmed': 'Error Confirmed',
  modified: 'Modified',
  disabled: 'Disabled',
}
const subtitles = {
  bonded: 'Swaps that were bonded but not executed or cancelled',
  locked: 'Swaps that were locked but not released',
  conflict: 'Swaps that only executed or only released',
  double: 'Swaps that were released more than once',
  'dup-hash': 'Swaps that have events with same hashes',
}
const tabs = [
  { key: 'bonded', name: 'Bonded',  },
  { key: 'locked', name: 'Locked' },
  { key: 'need-release', name: 'Releasing*' },
  { key: 'need-execute', name: 'Released' },
  { key: 'need-unlock', name: 'Need Unlock' },
  { key: 'dup-hash', name: 'Dup Hash' },
  { key: 'error-confirmed', name: 'Error Confirmed' },
  { key: 'modified', name: 'Modified' },
  { key: 'disabled', name: 'Disabled' },
  { key: 'double', name: 'Double' },
]

export default function PendingSwapList() {
  const router = useRouter()

  const { type, from, to, size = 10 } = router.query

  React.useEffect(() => {
    if (!titles[type]) {
      return null
    }
  }, [type])

  if (!titles[type]) {
    return null
  }

  const queryUrlParamList = []
  if (from) {
    queryUrlParamList.push(`from=${from}`)
  }
  if (to) {
    queryUrlParamList.push(`to=${to}`)
  }
  const queryUrlParam = queryUrlParamList.join('&')
  const queryUrl = `swap/pending/${type}` + (queryUrlParam && `?${queryUrlParam}`)

  return (
    <PagiCard
      title={titles[type]}
      subtitle={subtitles[type]}
      tabs={tabs.map(t => ({
        ...t,
        active: t.key === type,
        onClick: () => (t.key !== type) && router.push(`/pending/${t.key}`)
      }))}
      queryUrl={queryUrl}
      fallback={`/pending/${type}`}
      pageSize={size}
      reducer={(prev, item) => (BigInt(Math.round(prev * 1e6)) + BigInt(Swap.decode(item.encoded).amount)).toString() / 1e6}
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
      Row={WrappedSwapRow}
    />
  )
}

function WrappedSwapRow (props) {
  if (typeof props.data === 'number') {
    return (
      <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
        <Td size='' colSpan='100%' className='pl-4 pr-3 sm:pl-6 py-2 text-sm'>
          {props.data}
        </Td>
      </tr>
    )
  }
  return SwapRow(props)
}
