import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'
import Table from '../../components/Table'
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
  const { address, page = '1' } = router.query
  const { data, error } = useSWR(`${address}:${page}`, fetcher)
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

  const { total, list } = data
  const onPageChange = page => router.push({
    query: { address, page: page + 1 }
  })
  return (
    <Card>
      <CardTitle
        title='Address'
        subtitle={address}
      />
      <CardBody>
        <Table headers={[
          { name: 'swap id / time', className: 'pl-4 sm:pl-6' },
          { name: 'status' }, { name: 'from' }, { name: 'to' }, { name: 'amount' },
          { name: 'duration', className: 'hidden md:table-cell' }
        ]}>
          {list.map(swap => <SwapRow key={swap._id} swap={swap} />)}
        </Table>
        <Pagination size={10} page={data.page} total={total} onPageChange={onPageChange} />
      </CardBody>
    </Card>
  )
}
