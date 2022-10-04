import React from 'react'
import classnames from 'classnames'

export default function Table ({ headers, size = 'md', children, list }) {
  return (
    <div className='overflow-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {headers.map((item, index) => (
              <Th key={`th-${index}`} size={index ? 'md' : size} width={item.width} className={item.className}>{item.name}</Th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {typeof children === 'function' ? children(list) : children}
        </tbody>
      </table>
    </div>
  )
}

export function Th({ size = 'md', width, className, children }) {
  return (
    <th
      scope='col'
      width={width}
      className={classnames(
        'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        size === 'lg' && 'pl-4 pr-3 sm:pl-6 py-2',
        size === 'md' && 'px-2 md:px-3 sm:py-3 py-2',
        size === 'sm' && 'px-2 py-2',
        className
      )}
    >{children}</th>
  )
}

export function Td({ className, size = 'md', children }) {
  return (
    <td className={classnames(
      'whitespace-nowrap',
      size === 'lg' && 'pl-4 pr-3 sm:pl-6 py-2',
      size === 'md' && 'px-2 md:px-3 sm:py-4 py-2',
      size === 'sm' && 'px-2 md:px-3 py-1 text-sm',
      className
    )}>
      {children}
    </td>
  )
}