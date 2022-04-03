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
    <a href={href} className='flex items-center text-gray-500 hover:text-primary hover:underline cursor-pointer' target='_blank' rel='noreferrer'>
      <div className='flex itmes-center w-4 h-4 mr-1'>
        {logo && <Image src={logo} alt='' />}
      </div>
      <div className={classnames('text-xs', responsive ? 'hidden lg:flex' : 'flex')}>
        {token.symbol}
      </div>
    </a>
  )
}