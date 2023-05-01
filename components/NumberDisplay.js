import classnames from 'classnames'

import { Loading } from 'components/LoadingScreen'

export default function NumberDisplay ({ value, decimals = 6, length = 7, className }) {
  if (!value) {
    return <div className='flex items-center h-5 ml-[100px] mr-[6px]'><Loading /></div>
  }

  const [i, d = ''] = value.split('.')
  return (
    <pre className={classnames('text-sm font-mono mr-1', className)}>
      <span>{i.padStart(length, ' ')}</span>
      <span className='opacity-40'>
        {decimals > 0 ? '.' : ''}{d.padEnd(decimals, '0').substring(0, decimals)}
      </span>
    </pre>
  )
}