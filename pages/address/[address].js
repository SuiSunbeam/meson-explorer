import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from '../../components/LoadingScreen'
import CardTitle from '../../components/CardTitle'
import { Th } from '../../components/Table'
import SwapRow from '../../components/SwapRow'
import Pagination from '../../components/Pagination'

const fetcher = async param => {
  const [address, pageStr] = param.split(':') 

  const page = Number(pageStr || 1) - 1
  if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
    throw new Error()
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/address/${address}/swap?page=${page}`)
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

export default function AddressSwapList() {
  const router = useRouter()
  const { address, pageStr = '1' } = router.query
  const { data, error } = useSWR(`${address}:${pageStr}`, fetcher)
  React.useEffect(() => {
    if (error) {
      router.replace('/')
    }
  }, [error])

  if (error) {
    return null
  } else if (!data) {
    return <LoadingScreen />
  }

  const { page, total, list } = data
  const onPageChange = page => {
    router.push(`/?page=${page+1}`)
  }
  return (
    <div className='shadow overflow-hidden border-b border-gray-200 rounded-lg'>
      <CardTitle
        title='Address'
        subtitle={address}
      />
      <div className='border-t border-gray-200'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <Th className='pl-4 sm:pl-6'>swap id / time</Th>
              <Th>status</Th>
              <Th>from</Th>
              <Th>to</Th>
              <Th>amount</Th>
              <Th>duration</Th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {list.map(swap => <SwapRow key={swap._id} swap={swap} />)}
          </tbody>
        </table>
        <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
