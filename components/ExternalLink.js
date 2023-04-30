import { ExternalLinkIcon } from '@heroicons/react/outline'
import classnames from 'classnames'

export function ExternalIcon({ href }) {
  return (
    <a href={href} className='inline-flex items-center' target='_blank' rel='noreferrer'>
      <ExternalLinkIcon className='inline-block w-4 ml-1 hover:text-primary' aria-hidden='true' />
    </a>
  )
}

export default function ExternalLink({ size = 'xs', href, className, children }) {
  return (
    <a
      className={classnames('text-gray-500 hover:text-primary hover:underline cursor-pointer', `text-${size}`, className)}
      href={href}
      target='_blank'
      rel='noreferrer'
    >
      {children}
    </a>
  )
}