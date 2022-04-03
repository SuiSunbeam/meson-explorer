import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { SearchIcon } from '@heroicons/react/outline'

import LoadingScreen from '../components/LoadingScreen'
import Card from '../components/Card'
import Table from '../components/Table'
import SwapRow from '../components/SwapRow'
import Pagination from '../components/Pagination'
import Button from '../components/Button'

const fetcher = async pageStr => {
  const page = Number(pageStr || 1) - 1
  if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
    throw new Error()
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/swap?page=${page}`)
  const json = await res.json()
  if (json.result) {
    const { total, list } = json.result
    if (page * 10 > total) {
      throw new Error()
    }
    return { page, total, list }
  } else {
    throw new Error(json.error.message)
  }
}

export default function SwapList() {
  const router = useRouter()
  const { data, error } = useSWR(router.query.page || '1', fetcher)
  React.useEffect(() => {
    if (error) {
      router.replace('/')
    }
  }, [router, error])

  const [search, setSearchValue] = React.useState('')

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const { page, total, list } = data
    const onPageChange = page => router.push(`/?page=${page+1}`)
    body = (
      <>
        <Table headers={[
          { name: 'swap id / time', width: '18%', className: 'pl-3 md:pl-4 hidden sm:table-cell' },
          { name: 'swap id', width: '18%', className: 'sm:hidden' },
          { name: 'status', width: '10%', className: 'hidden sm:table-cell' },
          { name: 'from', width: '18%' },
          { name: 'to', width: '18%' },
          { name: 'amount', width: '18%' },
          { name: 'fee', width: '9%', className: 'hidden md:table-cell' },
          { name: 'duration', width: '9%', className: 'hidden lg:table-cell' }
        ]}>
          {list.map(row => <SwapRow key={row._id} data={row} />)}
        </Table>
        <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
      </>
    )
  }

  return (
    <div>
      <div className='mb-2 sm:mb-3'>
        <div className='relative rounded-md shadow-sm'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <SearchIcon className='text-gray-500 sm:text-sm w-4'/>
          </div>
          <form onSubmit={evt => {
            evt.preventDefault()
            if (search.length === 66) {
              router.push(`/swap/${search}`)
            } else {
              router.push(`/address/${search}`)
            }
          }}>
            <input
              type='search'
              className='focus:ring-primary-100 focus:border-primary block w-full pl-9 pr-2 sm:text-sm border-gray-200 rounded-md'
              placeholder='Search by swap id, encoded or address'
              value={search}
              onChange={evt => setSearchValue(evt.target.value)}
            />
          </form>
        </div>
      </div>
      <Card overflow>
        {body}
      </Card>
    </div>
  )
}
