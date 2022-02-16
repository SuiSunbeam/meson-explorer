import classnames from 'classnames'

const badgeClassnames = {
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-indigo-100 text-indigo-600',
  warning: 'bg-warning-100 text-warning',
  error: 'bg-red-100 text-red-600',
}

export default function Badge({ type, className, children }) {
  return (
    <span className={classnames(
      'px-2 inline-flex text-sm leading-5 font-semibold rounded-full',
      badgeClassnames[type] || 'bg-gray-100 text-gray-400',
      className
    )}>
      {children}
    </span>
  )
}
