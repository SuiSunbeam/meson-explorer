import classnames from 'classnames'

export default function Button({ size = 'md', active, rounded, disabled, className, onClick, children }) {
  return (
    <div
      className={classnames(
        'relative inline-flex items-center bg-white hover:bg-gray-50 border border-gray-300 font-medium text-gray-700',
        size === 'md' && 'text-sm px-4 py-2',
        size === 'sm' && 'text-sm px-3 py-1',
        size === 'xs' && 'text-xs px-2 py-1',
        active && 'z-10 border-primary bg-primary-100 hover:bg-primary-100 cursor-default',
        disabled ? 'text-gray-200 hover:text-gray-200 cursor-not-allowed' : 'cursor-pointer',
        rounded && 'rounded-md',
        className
      )}
      onClick={() => !disabled && onClick()}
    >
      {children}
    </div>
  )
}
