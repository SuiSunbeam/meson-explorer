import React from 'react'
import { useRouter } from 'next/router'

import { usePagination } from 'lib/fetcher'

import LoadingScreen from 'components/LoadingScreen'

import Pagination from './Pagination'

export default function PagiList({ queryUrl, fallback, reducer, noSize, maxPage, children }) {
  const router = useRouter()
  const { data, total, error, page, size } = usePagination(queryUrl, router.query, { fetchTotal: !maxPage })

  React.useEffect(() => {
    if ((router.query.size || 10) != size) {
      const { page, size: _, ...rest } = router.query
      const query = { page, size, ...rest }
      if (size === 10) {
        delete query.size
      }
      router.replace({ query })
    }
  }, [size, router])

  React.useEffect(() => {
    if (Number.isNaN(page)) {
      router.replace(fallback)
    }
  }, [router, fallback, page])

  if (error) {
    return <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    return <LoadingScreen />
  } else {
    const { maxPage: mp } = data
    const list = [...data.list]
    if (reducer && list.length) {
      list.unshift(list.reduce(reducer, null))
    }
    if (total && page * size > total) {
      router.replace('/')
    }
    const onPageChange = page => router.push({ query: { ...router.query, page: page + 1 } })

    return (
      <>
        {React.cloneElement(children, { list })}
        <Pagination page={page} size={size} noSize={noSize} currentSize={list.length} total={total} maxPage={mp || maxPage} onPageChange={onPageChange} />
      </>
    )
  }
}
