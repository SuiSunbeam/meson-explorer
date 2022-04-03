import classnames from 'classnames'
import Button from './Button'

export default function Card({ overflow, className, children }) {
  const card = (
    <div className={classnames(
      'overflow-hidden border-b border-gray-200 rounded-lg shadow bg-white',
      className
    )}>
      {children}
    </div>
  )
  if (overflow) {
    return (
      <div className='inline-block min-w-full align-middle mr-2 sm:mr-4 lg:mr-8'>
        {card}
      </div>
    )
  }
  return card
}

export function CardTitle({ title, subtitle, badge, right = [], tabs = [] }) {
  return (
    <div className='px-4 pt-5 bg-white sm:px-6 -mb-px'>
      <div className='flex items-center h-8'>
        <div className='text-xl font-medium leading-6 text-gray-900'>{title}</div>
        <div className='ml-2 flex-1'>{badge}</div>
        <div>{right}</div>
      </div>
      <p className='max-w-2xl mt-1 text-gray-500 break-all'>{subtitle}</p>
      <div className='max-w-screen text-gray-500 mt-5 flex overflow-auto'>
      {tabs.map((t, index) => (
        <div
          key={`tab-${index}`}
          onClick={t.onClick}
          className={classnames(
            'py-2 mr-6 cursor-pointer whitespace-nowrap',
            t.active ? 'border-b-2 border-primary text-primary' : 'hover:border-b-2 border-gray-300'
          )}
        >{t.name}</div>
      ))}
      </div>
    </div>
  )
}

export function CardBody({ border = true, children }) {
  return (
    <div className={classnames(border && 'border-t border-gray-200')}>
      {children}
    </div>
  )
}

export function StatCard({ title, value }) {
  return (
    <Card className='px-4 py-3 sm:px-6 sm:py-4'>
      <div className='text-xs font-medium text-gray-500 uppercase'>{title}</div>
      <div className='mt-1 font-medium text-lg text-gray-900'>{value}</div>
    </Card>
  )
}