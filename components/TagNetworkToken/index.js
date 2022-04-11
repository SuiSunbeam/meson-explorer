import classnames from 'classnames'
import Image from 'next/image'

import usdc from './usdc.png'
import usdt from './usdt.png'

function getTokenLogo(symbol) {
  if (symbol.indexOf('USDC') > -1) {
    return usdc
  } else if (symbol.indexOf('USDT') > -1) {
    return usdt
  }
}

export default function TagNetworkToken ({ responsive, explorer, token }) {
  const logo = getTokenLogo(token.symbol)
  const href = `${explorer}/${token.link || `token/${token.addr}`}`
  return (
    <div className='flex items-center text-gray-500 hover:text-primary hover:underline cursor-pointer'>
      <a href={href} className='flex itmes-center w-4 h-4' target='_blank' rel='noreferrer'>
        {logo && <Image src={logo} alt='' />}
      </a>
      <a
        href={href}
        className={classnames('text-xs', responsive ? 'hidden lg:flex lg:ml-1' : 'flex ml-1')}
        target='_blank'
        rel='noreferrer'
      >
        {token.symbol}
      </a>
    </div>
  )
}