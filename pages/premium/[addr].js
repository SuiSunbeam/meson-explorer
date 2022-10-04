import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'
import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table from 'components/Table'
import Pagination from 'components/Pagination'

import { PaidPremiumRow } from './index'

export default function PaidPremiumList() {
  const router = useRouter()
  const page = Number(router.query.page || 1) - 1
  const pageValid = !Number.isNaN(page) && Number.isInteger(page) && page >= 0
  if (!pageValid) {
    router.replace(`/premium/${addr}`)
  }

  const addr = router.query.addr
  
  React.useEffect(() => {
    if (!pageValid) {
      router.replace(`/premium/${addr}`)
    }
  }, [pageValid, router, addr])

  const { data, error } = useSWR(pageValid && `premium/${addr}?page=${page}`, fetcher)

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
      router.replace(`/premium/${addr}`)
    }
    const onPageChange = page => router.push(`/premium/${addr}?page=${page+1}`)
    body = (
      <>
        <Table headers={[
          { name: 'initiator / time', width: '20%', className: 'pl-3 md:pl-4 hidden sm:table-cell' },
          { name: 'type', width: '10%' },
          { name: 'tx hash', width: '20%' },
          { name: 'paid', width: '10%' },
          { name: 'usage', width: '15%' },
          { name: 'valid', width: '25%' }
        ]}>
          {list.map(row => <PaidPremiumRow key={row._id} linkPrefix='address' {...row} />)}
        </Table>
        <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
      </>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Paid Premium'
        subtitle={addr}
      />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}
