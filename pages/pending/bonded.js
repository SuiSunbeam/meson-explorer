import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import fetch from '../../lib/fetch'
import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'
import Table from '../../components/Table'
import SwapRow from '../../components/SwapRow'
import Pagination from '../../components/Pagination'

const fetcher = async pageStr => {
  const page = Number(pageStr || 1) - 1
  if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
    throw new Error('reset')
  }
  const res = await fetch(`api/v1/swap/bonded?page=${page}`)
  const json = await res.json()
  if (json.result) {
    const { total, list } = json.result
    if (page * 10 > total) {
      throw new Error('reset')
    }
    return { page, total, list }
  } else {
    throw new Error(json.error.message)
  }
}

export default function BondedSwapList() {
  const router = useRouter()
  const { data, error } = useSWR(router.query.page || '1', fetcher)
  React.useEffect(() => {
    if (error && error.message === 'reset') {
      router.replace('/pending/bonded')
    }
  }, [router, error])

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const { page, total, list } = data
    const onPageChange = page => router.push(`/pending/bonded?page=${page+1}`)
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
    <Card>
      <CardTitle
        title='Bonded Swaps'
        subtitle='Swaps that were bonded but not executed or cancelled'
      />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}
