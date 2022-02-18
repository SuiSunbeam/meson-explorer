import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from '../components/LoadingScreen'
import Card from '../components/Card'
import Table from '../components/Table'
import SwapRow from '../components/SwapRow'
import Pagination from '../components/Pagination'

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

  if (error) {
    return null
  } else if (!data) {
    return <LoadingScreen />
  }

  const { page, total, list } = data
  const onPageChange = page => router.push(`/?page=${page+1}`)
  return (
    <Card>
      <Table headers={[
        { name: 'swap id / time', className: 'pl-4 sm:pl-6' },
        { name: 'status' }, { name: 'from' }, { name: 'to' }, { name: 'amount' },
        { name: 'duration', className: 'hidden md:table-cell' }
      ]}>
        {list.map(swap => <SwapRow key={swap._id} swap={swap} />)}
      </Table>
      <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
    </Card>
  )
}
