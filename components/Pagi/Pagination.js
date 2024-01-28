import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { Loading } from 'components/LoadingScreen'

import Button from '../Button'
import ButtonGroup from '../ButtonGroup'

export default function Pagination({ size, page, noSize, currentSize, total, maxPage, onPageChange }) {
  const hasMore = currentSize >= size
  const pages = React.useMemo(() => {
    if (!total) {
      return maxPage || page + (hasMore ? 2 : 1)
    }
    const pages = Math.ceil(total / size)
    if (maxPage && pages > maxPage) {
      return maxPage
    } else {
      return pages
    }
  }, [total, size, page, hasMore, maxPage])
  const loading = !total && !maxPage && pages > page + 1
  return (
    <div className='flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6'>
      <SmPagination page={page} pages={pages} total={total} onPageChange={onPageChange} />
      <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
        <div className='flex flex-row items-center gap-4'>
          <PagiDescription size={size} page={page} currentSize={currentSize} total={total} maxPage={maxPage} />
          <PagiSizeSelection size={size} noSize={noSize} />
        </div>
        <PagiButtonsWithChevron page={page} pages={pages} loading={loading} onPageChange={onPageChange} />
      </div>
    </div>
  )
}

function SmPagination ({ page, pages, total, onPageChange }) {
  return (
    <div className='flex-1 flex justify-between items-center sm:hidden'>
      <Button
        rounded
        size='sm'
        disabled={page <= 0}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <div className='text-sm text-gray-500'>Page {page+1}{total ? `/${pages}` : ''}</div>
      <Button
        rounded
        size='sm'
        disabled={page >= pages - 1}
        className='ml-3'
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

function PagiDescription ({ size, page, currentSize, total, maxPage }) {
  const start = size * page + 1
  const end = size * page + currentSize
  const desc = <>Showing <span className='font-medium'>{start}</span> to <span className='font-medium'>{end}</span></>
  if (!total) {
    return (
      <div className='text-sm text-gray-500'>
        {desc}
      </div>
    )
  }

  const displayTotal = (maxPage && (maxPage * size) < total) ? `${maxPage * size}+` : total
  return (
    <div className='text-sm text-gray-500'>
      {desc} of <span className='font-medium'>{displayTotal}</span> results
    </div>
  )
}

function PagiSizeSelection ({ size, noSize }) {
  const router = useRouter()
  const { data: session } = useSession()
  const authorized = session?.user?.roles?.some(r => ['root', 'admin'].includes(r))

  const onSize = React.useCallback(size => {
    const query = router.query
    query.size = Number(size)
    if (query.size === 10) {
      delete query.size
    }
    router.push({ query })
  }, [router])

  if (!authorized || noSize) {
    return null
  }
  return (
    <ButtonGroup
      size='sm'
      active={size.toString()}
      buttons={[{ key: '10', text: 10 }, { key: '50', text: 50 }, { key: '100', text: 100 }]}
      onChange={onSize}
    />
  )
}

function PagiButtonsWithChevron ({ page, pages, loading, onPageChange }) {
  return (
    <div>
      <nav className='relative z-0 inline-flex -space-x-px rounded-md shadow-sm' aria-label='Pagination'>
        <Button
          size='sm'
          className='px-1.5 text-gray-500 rounded-l-md'
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <span className='sr-only'>Previous</span>
          <ChevronLeftIcon className='w-5 h-5' aria-hidden='true' />
        </Button>
        <PagiButtons page={page} pages={pages} onPageChange={onPageChange} />
        {loading && <PagiLoading />}
        <Button
          size='sm'
          className='px-1.5 text-gray-500 rounded-r-md'
          disabled={page >= pages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <span className='sr-only'>Next</span>
          <ChevronRightIcon className='w-5 h-5' aria-hidden='true' />
        </Button>
      </nav>
    </div>
  )
}

function PagiButtons ({ page, pages, onPageChange }) {
  const buttons = [
    <PagiButton key={`page-${page}`} active page={page} onPageChange={onPageChange} />
  ]
  if (page < 4) {
    for (let i = page-1; i >= 0; i--) {
      buttons.unshift(<PagiButton key={`page-${i}`} page={i} onPageChange={onPageChange} />)
    }
  } else {
    buttons.unshift(<PagiButton key={`page-${page-1}`} page={page-1} onPageChange={onPageChange} />)
    buttons.unshift(<PagiEtc />)
    buttons.unshift(<PagiButton key='page-0' page={0} onPageChange={onPageChange} />)
  }
  if (page > pages - 5) {
    for (let i = page+1; i < pages; i++) {
      buttons.push(<PagiButton key={`page-${i}`} page={i} onPageChange={onPageChange} />)
    }
  } else {
    buttons.push(<PagiButton key={`page-${page+1}`} page={page+1} onPageChange={onPageChange} />)
    buttons.push(<PagiEtc />)
    buttons.push(<PagiButton key={`page-${pages-1}`} page={pages-1} onPageChange={onPageChange} />)
  }
  return buttons
}

function PagiEtc () {
  return (
    <span className='relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300'>
      ...
    </span>
  )
}

function PagiLoading () {
  return (
    <span className='relative inline-flex items-center px-2.5 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300'>
      <Loading />
    </span>
  )
}

function PagiButton ({ active, mdHidden, page, onPageChange }) {
  return (
    <Button
      active={active}
      size='sm'
      className={classnames(
        'text-gray-500',
        mdHidden && 'hidden md:inline-flex relative'
      )}
      onClick={() => onPageChange(page)}
    >
      {page + 1}
    </Button>
  )
}