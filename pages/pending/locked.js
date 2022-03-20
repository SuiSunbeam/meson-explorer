import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'
import Table from '../../components/Table'
import SwapRow from '../../components/SwapRow'
import Pagination from '../../components/Pagination'

const fetcher = async pageStr => {
  const page = Number(pageStr || 1) - 1
  if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
    throw new Error()
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/swap/locked?page=${page}`)
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

export default function LockedSwapList() {
  const router = useRouter()
  const { data, error } = useSWR(router.query.page || '1', fetcher)
  React.useEffect(() => {
    if (error) {
      router.replace('/')
    }
  }, [router, error])

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const { page, total, list } = data
    const onPageChange = page => router.push(`/pending/locked?page=${page+1}`)
    body = (
      <>
        <Table headers={[
          { name: 'swap id / time', width: '18%', className: 'pl-4 sm:pl-6' },
          { name: 'status', width: '10%' },
          { name: 'from', width: '18%' },
          { name: 'to', width: '18%' },
          { name: 'amount', width: '18%' },
          { name: 'fee', width: '9%' },
          { name: 'duration', width: '9%', className: 'hidden md:table-cell' }
        ]}>
          {list.map(row => <SwapRow key={row._id} {...row} />)}
        </Table>
        <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
      </>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Locked Swaps'
        subtitle='Swaps that were locked but released'
      />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}
