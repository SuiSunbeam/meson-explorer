import classnames from 'classnames'

export default function ListRow({ size = 'md', title, children }) {
  return (
    <ListRowWrapper size={size}>
      <dt className='text-sm font-medium text-gray-500 uppercase'>{title}</dt>
      <dd className='mt-1 text-gray-900 sm:mt-0 sm:col-span-2'>
        {children}
      </dd>
    </ListRowWrapper>
  )
}

export function ListRowWrapper({ size = 'md', children }) {
  return (
    <div className={classnames(
      'sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200',
      'odd:bg-gray-50 even:bg-white',
      size === 'md' && 'px-4 py-5',
      size === 'sm' && 'px-4 py-3',
    )}>
      {children}
    </div>
  )
}
