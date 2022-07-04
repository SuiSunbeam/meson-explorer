import classnames from 'classnames'
import Image from 'next/image'

import usdc from './usdc.png'
import usdt from './usdt.png'
import msn from './msn.png'
import uct from './uct.png'

function getTokenLogo(symbol) {
  if (symbol.indexOf('USDC') > -1) {
    return usdc
  } else if (symbol.indexOf('USDT') > -1) {
    return usdt
  } else if (symbol.indexOf('MSN') > -1) {
    return msn
  } else if (symbol.indexOf('UCT') > -1) {
    return uct
  }
}

export default function TagNetworkToken ({ responsive, explorer, token, iconOnly, className }) {
  const logo = getTokenLogo(token.symbol)
  const href = explorer && `${explorer}/${token.link || `token/${token.addr}`}`
  return (
    <div className={classnames('flex items-center text-gray-500', href && 'cursor-pointer hover:text-primary hover:underline', className)}>
      <a href={href} className='flex items-center w-4 rounded-full shadow' target='_blank' rel='noreferrer'>
        {logo && <Image src={logo} alt='' />}
      </a>
      {
        !iconOnly &&
        <a
          href={href}
          className={classnames('text-xs', responsive ? 'hidden lg:flex lg:ml-1' : 'flex ml-1')}
          target='_blank'
          rel='noreferrer'
        >
          {token.symbol}
        </a>
      }
    </div>
  )
}