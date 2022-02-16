import classnames from 'classnames'

export default function Table ({ headers, children }) {
  return (
    <table className='min-w-full divide-y divide-gray-200'>
      <thead className='bg-gray-50'>
        <tr>
          {headers.map((item, index) => (
            <Th key={`th-${index}`} className={!index && 'pl-4 sm:pl-6'}>{item}</Th>
          ))}
        </tr>
      </thead>
      <tbody className='bg-white divide-y divide-gray-200'>
        {children}
      </tbody>
    </table>
  )
}

export function Th({ className, children }) {
  return (
    <th
      scope='col'
      className={classnames(
        'p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
    >{children}</th>
  )
}

export function Td({ className, children }) {
  return (
    <td className={classnames('px-3 py-4 whitespace-nowrap', className )}>
      {children}
    </td>
  )
}