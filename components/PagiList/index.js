import React from 'react'
import { useRouter } from 'next/router'

import { usePagination } from 'lib/fetcher'

import LoadingScreen from 'components/LoadingScreen'

import Pagination from './Pagination'

export default function PagiList({ queryUrl, fallback, redirectFallback = () => false, maxPage, children }) {
  const router = useRouter()
  const { data, error, page } = usePagination(queryUrl, router.query.page)

  if (Number.isNaN(page) || redirectFallback(error, page)) {
    router.replace(fallback)
  }

  if (error) {
    return <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    return <LoadingScreen />
  } else {
    const { total, list } = data
    if (page * 10 > total) {
      router.replace('/')
    }
    const onPageChange = page => router.push(`${fallback}?page=${page + 1}`)

    return (
      <>
        {React.cloneElement(children, { list })}
        <Pagination size={10} page={page} total={total} maxPage={maxPage} onPageChange={onPageChange} />
      </>
    )
  }
}