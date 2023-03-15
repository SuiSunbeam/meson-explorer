import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SearchIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import PagiCard from 'components/Pagi/PagiCard'
import SwapRow from 'components/SwapRow'

export default function SwapList() {
  const router = useRouter()
  const { data: session } = useSession()
  const authorized = session?.user?.roles?.some(r => ['root', 'admin'].includes(r))

  const [search, setSearchValue] = React.useState('')

  const { filter } = router.query
  const tabs = !authorized ? undefined : [
    { key: 'all', name: 'All', active: !filter, onClick: () => router.push('') },
    { key: 'api', name: 'API', active: filter === 'api', onClick: () => router.push({ query: { filter: 'api' } }) },
    { key: 'api', name: 'meson.to', active: filter === 'meson.to', onClick: () => router.push({ query: { filter: 'meson.to' } }) },
  ]
  const queryUrl = filter ? `swap?filter=${filter}` : 'swap'

  return (
    <div>
      <div className='mb-2 sm:mb-3'>
        <div className='relative rounded-md shadow'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <SearchIcon className='text-gray-500 sm:text-sm w-4'/>
          </div>
          <form onSubmit={evt => {
            evt.preventDefault()
            let searchValue = search.trim()
            if (ethers.utils.isAddress(searchValue)) {
              searchValue = searchValue.toLowerCase()
            }
            if (!searchValue) {
              return
            }
            if (searchValue.length === 66) {
              router.push(`/swap/${searchValue}`)
            } else {
              router.push(`/address/${searchValue}`)
            }
          }}>
            <input
              type='search'
              className='focus:ring-primary-50 focus:border-primary block w-full pl-9 pr-2 sm:text-sm border-gray-200 rounded-md'
              placeholder='Search by swap id, encoded or address'
              value={search}
              onChange={evt => setSearchValue(evt.target.value)}
            />
          </form>
        </div>
      </div>
      <PagiCard
        title='Latest Swaps'
        tabs={tabs}
        queryUrl={queryUrl}
        fallback='/'
        isValid={page => page >= 10 && !authorized}
        maxPage={authorized ? 0 : 10}
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
    </div>
  )
}
