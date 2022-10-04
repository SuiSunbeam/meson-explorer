import classnames from 'classnames'
import Image from 'next/image'

import { getExplorerTokenLink } from 'lib/swap'

import usdc from './usdc.png'
import usdt from './usdt.png'
import busd from './busd.png'
import uct from './uct.png'

function getTokenLogo(symbol) {
  if (symbol.indexOf('USDC') > -1) {
    return usdc
  } else if (symbol.indexOf('USDT') > -1) {
    return usdt
  } else if (symbol.indexOf('BUSD') > -1) {
    return busd
  } else if (symbol.indexOf('UCT') > -1) {
    return uct
  }
}

export default function TagNetworkToken ({ responsive, size = 'sm', explorer, token, iconOnly, className }) {
  if (!token) {
    return null
  }
  const logo = getTokenLogo(token.symbol)
  const tokenLink = getExplorerTokenLink(token)
  const href = explorer && `${explorer}/${tokenLink}`
  return (
    <div className={classnames('flex items-center text-gray-500', href && 'cursor-pointer hover:text-primary hover:underline', className)}>
      <a
        href={href}
        className={classnames('flex items-center rounded-full shadow', size === 'md' ? 'w-5 h-5' : 'w-4 h-4')}
        target='_blank'
        rel='noreferrer'
      >
        {logo && <Image src={logo} alt='' />}
      </a>
      {
        !iconOnly &&
        <a
          href={href}
          className={classnames('text-xs mt-px', responsive ? 'hidden lg:flex lg:ml-1' : 'flex ml-1')}
          target='_blank'
          rel='noreferrer'
        >
          {token.symbol}
        </a>
      }
    </div>
  )
}