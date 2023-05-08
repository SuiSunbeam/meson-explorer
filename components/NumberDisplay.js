import classnames from 'classnames'

import { Loading } from 'components/LoadingScreen'

export default function NumberDisplay ({ value, decimals = 6, length = 6, className }) {
  const width = (length + decimals + (decimals && 1)) * 8.5

  if (!value) {
    return <div className='flex shrink-0 h-5 items-center justify-end mr-1' style={{ width }}><Loading /></div>
  }

  const [i, d = ''] = value.split('.')
  return (
    <pre className={classnames('shrink-0 text-sm font-mono mr-1', className)} style={{ width }}>
      <span>{i.padStart(length, ' ')}</span>
      <span className='opacity-40'>
        {decimals > 0 ? '.' : ''}{d.padEnd(decimals, '0').substring(0, decimals)}
      </span>
    </pre>
  )
}