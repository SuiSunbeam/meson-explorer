import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

import fetcher from '../../lib/fetcher'
import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'
import Table from '../../components/Table'
import SwapRow from '../../components/SwapRow'
import Pagination from '../../components/Pagination'

export default function AuthWrapper() {
  const { data: session } = useSession()

  if (!session?.user) {
    return 'Need login'
  }

  if (!session.user.roles?.includes('admin')) {
    return 'Unauthorized'
  }
  
  return <ConflictSwapList />
}

function ConflictSwapList() {
  const router = useRouter()
  const page = Number(router.query.page || 1) - 1
  const pageValid = !Number.isNaN(page) && Number.isInteger(page) && page >= 0
  if (!pageValid) {
    router.replace('/')
  }
  
  React.useEffect(() => {
    if (!pageValid) {
      router.replace('/pending/conflict')
    }
  }, [pageValid, router])

  const { data, error } = useSWR(pageValid && `swap/conflict?page=${page}`, fetcher)

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
      router.replace('/pending/conflict')
    }
    const onPageChange = page => router.push(`/pending/conflict?page=${page+1}`)
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
        title='Conflict Swaps'
        subtitle='Swaps that only executed or only released'
      />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}
