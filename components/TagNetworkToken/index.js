import Image from 'next/image'

import ExternalLink from '../ExternalLink'

import usdc from './usdc.png'
import usdt from './usdt.png'

function getTokenLogo(symbol) {
  if (symbol.indexOf('USDC') > -1) {
    return usdc
  } else if (symbol.indexOf('USDT') > -1) {
    return usdt
  }
}

export default function TagNetworkToken ({ explorer, token }) {
  const logo = getTokenLogo(token.symbol)
  const href = `${explorer}/token/${token.addr}`
  return (
    <div className='flex items-center'>
      <a href={href} className='flex itmes-center w-4 h-4 mr-1' target='_blank' rel='noreferrer'>
        {logo && <Image src={logo} alt='' />}
      </a>
      <div className='hidden md:flex'>
        <ExternalLink href={href}>
          {token.symbol}
        </ExternalLink>
      </div>
    </div>
  )
}