import classnames from 'classnames'

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