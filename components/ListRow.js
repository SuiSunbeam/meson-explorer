import classnames from 'classnames'

export default function ListRow({ size = 'md', title, children }) {
  return (
    <ListRowWrapper size={size}>
      <dt className='flex-1 shrink text-sm font-medium text-gray-500 uppercase'>{title}</dt>
      <dd className='md:flex-[2] mt-1 md:mt-0 md:min-w-[540px] text-gray-900 '>
        {children}
      </dd>
    </ListRowWrapper>
  )
}

export function ListRowWrapper({ size = 'md', children }) {
  return (
    <div className={classnames(
      'flex flex-col md:flex-row md:px-6 border-t border-gray-200',
      'odd:bg-gray-50 even:bg-white',
      size === 'md' && 'px-4 py-5',
      size === 'sm' && 'px-4 py-3',
      size === 'xs' && 'px-4 py-2',
    )}>
      {children}
    </div>
  )
}
