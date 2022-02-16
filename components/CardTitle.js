import Badge from './Badge'

export default function CardTitle({ title, subtitle, badge, badgeType }) {
  return (
    <div className='px-4 py-5 bg-white sm:px-6'>
      <div className='flex items-center'>
        <span className='text-xl font-medium leading-6 text-gray-900'>{title}</span>
        <Badge type={badgeType} className='ml-2'>{badge}</Badge>
      </div>
      <p className='max-w-2xl mt-1 text-gray-500'>{subtitle}</p>
    </div>
  )
}
