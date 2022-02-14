import classnames from 'classnames'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import Button from './Button'

export default function Pagination({ size = 10, page, total, onPageChange }) {
  const pages = Math.floor(total / size) + 1
  return (
    <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
      <SmPagination page={page} pages={pages} onPageChange={onPageChange} />
      <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
        <PagiDescription size={size} page={page} total={total} />
        <PagiButtonsWithChevron page={page} pages={pages} onPageChange={onPageChange} />
      </div>
    </div>
  )
}

function SmPagination ({ page, pages, onPageChange }) {
  return (
    <div className='flex-1 flex justify-between sm:hidden'>
      <Button
        rounded
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <Button
        rounded
        disabled={page === pages - 1}
        className='ml-3'
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

function PagiDescription ({ size, page, total }) {
  const start = size * page + 1
  const end = Math.min(size * page + size, total)
  return (
    <div className='text-sm text-gray-700'>
      Showing <span className='font-medium'>{start}</span> to <span className='font-medium'>{end}</span> of <span className='font-medium'>{total}</span> results
    </div>
  )
}

function PagiButtonsWithChevron ({ page, pages, onPageChange }) {
  return (
    <div>
      <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px' aria-label='Pagination'>
        <Button
          className='px-2 rounded-l-md text-gray-500'
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <span className='sr-only'>Previous</span>
          <ChevronLeftIcon className='h-5 w-5' aria-hidden='true' />
        </Button>
        <PagiButtons page={page} pages={pages} onPageChange={onPageChange} />
        <Button
          className='px-2 rounded-r-md text-gray-500'
          disabled={page === pages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          <span className='sr-only'>Next</span>
          <ChevronRightIcon className='h-5 w-5' aria-hidden='true' />
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
    <span className='relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700'>
      ...
    </span>
  )
}

function PagiButton ({ active, mdHidden, page, onPageChange }) {
  return (
    <Button
      active={active}
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