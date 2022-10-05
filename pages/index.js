import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { SearchIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import Card from 'components/Card'
import PagiList from 'components/Pagi/PagiList'
import Table from 'components/Table'
import SwapRow from 'components/SwapRow'

export default function SwapList() {
  const router = useRouter()
  const { data: session } = useSession()
  const authorized = session?.user?.roles?.includes('admin')

  const [search, setSearchValue] = React.useState('')

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
      <Card>
        <PagiList
          queryUrl='swap'
          fallback='/'
          isValid={page => page >= 10 && !authorized}
          maxPage={authorized ? 0 : 10}
        >
          <Table headers={[
            { name: 'swap id / time', width: '18%', className: 'pl-3 md:pl-4 hidden sm:table-cell' },
            { name: 'swap id', width: '18%', className: 'pl-3 sm:hidden' },
            { name: 'status', width: '10%', className: 'hidden sm:table-cell' },
            { name: 'from', width: '18%' },
            { name: 'to', width: '18%' },
            { name: 'amount', width: '18%' },
            { name: 'fee', width: '9%', className: 'hidden md:table-cell' },
            { name: 'duration', width: '9%', className: 'hidden lg:table-cell' }
          ]}>
            {list => list.map(row => <SwapRow key={row._id} smMargin data={row} />)}
          </Table>
        </PagiList>
      </Card>
    </div>
  )
}
