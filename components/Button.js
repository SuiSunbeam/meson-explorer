import classnames from 'classnames'

export default function Button({ size = 'md', color, active, rounded, disabled, className, onClick, children }) {
  return (
    <div
      className={classnames(
        'relative inline-flex items-center font-medium',
        size === 'md' && 'text-sm px-4 py-2',
        size === 'sm' && 'text-sm px-3 py-1',
        size === 'xs' && 'text-xs px-1 py-1',
        !color && 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-700',
        color === 'error' && 'text-white bg-red-500 hover:bg-red-600',
        color === 'primary' && 'text-white bg-primary hover:bg-primary-600',
        color === 'info' && 'text-white bg-indigo-500 hover:bg-indigo-600',
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
