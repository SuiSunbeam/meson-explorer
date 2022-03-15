import classnames from 'classnames'

const badgeClassnames = {
  success: 'bg-emerald-100 text-primary',
  info: 'bg-indigo-100 text-indigo-500',
  warning: 'bg-warning-100 text-warning',
  error: 'bg-red-100 text-red-400',
}

const tooltips = {
  CANCELLED: 'The swap expired and the fund was withdrawn',
  DROPPED: 'The swap is not processed before expiration',
  EXPIRED: 'The swap expired and funds need to be withdrawn'
}

export default function Badge({ type, className, children }) {
  const tooltip = tooltips[children]
  return (
    <div className={classnames('flex relative', tooltip && 'has-tooltip cursor-pointer')}>
      <span className={classnames(
        'px-2 inline-flex text-sm leading-5 font-semibold rounded-full',
        badgeClassnames[type] || 'bg-gray-100 text-gray-500',
        className
      )}>
        {children}
      </span>
      {
        tooltip &&
        <span className='tooltip ml-0 -mt-6 px-2 text-xs leading-5 font-medium border bg-white text-gray-800 rounded-lg shadow'>
          {tooltip}
        </span>
      }
    </div>
  )
}