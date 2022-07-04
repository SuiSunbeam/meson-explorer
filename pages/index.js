import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { SearchIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import fetcher from 'lib/fetcher'
import LoadingScreen from 'components/LoadingScreen'
import Card from 'components/Card'
import Table from 'components/Table'
import SwapRow from 'components/SwapRow'
import Pagination from 'components/Pagination'

export default function SwapList() {
  const { data: session } = useSession()
  const authorized = session?.user?.roles?.includes('admin')

  const router = useRouter()
  const page = Number(router.query.page || 1) - 1
  let pageValid = !Number.isNaN(page) && Number.isInteger(page) && page >= 0
  if (page >= 10 && !authorized) {
    pageValid = false
  }
  if (!pageValid) {
    router.replace('/')
  }

  const { data, error } = useSWR(pageValid && `swap?page=${page}`, fetcher)

  const [search, setSearchValue] = React.useState('')

  let body
  if (!pageValid) {
    body = <LoadingScreen />
  } else if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const { total, list } = data
    if (page * 10 > total) {
      router.replace('/')
    }
    const onPageChange = page => router.push(`/?page=${page+1}`)
    body = (
      <>
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
          {list.map(row => <SwapRow key={row._id} data={row} />)}
        </Table>
        <Pagination size={10} page={page} total={total} maxPage={authorized ? 0 : 10} onPageChange={onPageChange} />
      </>
    )
  }

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
        {body}
      </Card>
    </div>
  )
}
