import classnames from 'classnames'

export default function Table ({ headers, size = 'md', children }) {
  return (
    <table className='min-w-full divide-y divide-gray-200'>
      <thead className='bg-gray-50'>
        <tr>
          {headers.map((item, index) => (
            <Th key={`th-${index}`} size={size} width={item.width} className={item.className}>{item.name}</Th>
          ))}
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200'>
        {children}
      </tbody>
    </table>
  )
}

export function Th({ size = 'md', width, className, children }) {
  return (
    <th
      scope='col'
      width={width}
      className={classnames(
        'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        size === 'md' && 'p-3',
        size === 'sm' && 'px-3 py-2',
        className
      )}
    >{children}</th>
  )
}

export function Td({ className, size = 'md', children }) {
  return (
    <td className={classnames(
      'whitespace-nowrap',
      size === 'md' && 'px-3 py-4',
      size === 'sm' && 'px-3 py-1 text-sm',
      className
    )}>
      {children}
    </td>
  )
}