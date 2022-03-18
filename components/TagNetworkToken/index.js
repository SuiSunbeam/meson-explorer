import Image from 'next/image'

import ExternalLink from '../ExternalLink'

import usdc from './usdc.png'
import usdt from './usdt.png'

function getTokenLogo(symbol) {
  console.log(symbol)
  if (symbol.indexOf('USDC') > -1) {
    return usdc
  } else if (symbol.indexOf('USDT') > -1) {
    return usdt
  }
}

export default function TagNetworkToken ({ explorer, token }) {
  const logo = getTokenLogo(token.symbol)
  return (
    <div className='flex items-center'>
      <div className='flex itmes-center w-4 h-4 mr-1'>
        {logo && <Image src={logo} alt='' />}
      </div>
      <div>
        <ExternalLink href={`${explorer}/token/${token.addr}`}>
          {token.symbol}
        </ExternalLink>
      </div>
    </div>
  )
}