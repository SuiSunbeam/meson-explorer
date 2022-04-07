import classnames from 'classnames'

import Button from './Button'

export default function ButtonGroup ({ size, active, buttons, onChange }) {
  const len = buttons.length
  return (
    <div className='relative w-fit z-0 flex -space-x-px rounded-md shadow-sm'>
    {
      buttons.map((btn, index) => (
        <Button
          key={`group-btn-${index}`}
          active={btn.key === active}
          size={size}
          className={classnames(
            'text-gray-500',
            index ? '' : 'rounded-l-md',
            index === len - 1 ? 'rounded-r-md' : ''
          )}
          onClick={() => onChange(btn.key)}
        >
          {btn.text}
        </Button>
      ))
    }
    </div>
  )
  
  
}