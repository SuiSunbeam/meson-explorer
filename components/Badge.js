import classnames from 'classnames'

const badgeClassnames = {
  success: 'bg-primary-100 text-primary',
  info: 'bg-indigo-100 text-indigo-500',
  warning: 'bg-warning-100 text-warning',
  error: 'bg-red-100 text-red-400',
}

export default function Badge({ type, className, onClick, children }) {
  return (
    <div className='flex relative' onClick={onClick}>
      <span className={classnames(
        'px-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm',
        badgeClassnames[type] || 'bg-gray-100 text-gray-500',
        onClick && 'cursor-pointer',
        className
      )}>
        {children}
      </span>
    </div>
  )
}