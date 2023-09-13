import classnames from 'classnames'
import Image from 'next/image'

import { getExplorerTokenLink } from 'lib/swap'

import eth from './eth.png'
import usdc from './usdc.png'
import usdt from './usdt.png'
import busd from './busd.png'
import dai from './dai.png'
import pod from './pod.png'
import uct from './uct.png'
import sfuel from '../TagNetwork/skale.png'

function getTokenIcon(symbol) {
  if (symbol.indexOf('ETH') > -1) {
    return eth
  } else if (symbol.indexOf('USDC') > -1 || symbol.indexOf('USDbC') > -1) {
    return usdc
  } else if (symbol.indexOf('USDT') > -1) {
    return usdt
  } else if (symbol.indexOf('BUSD') > -1) {
    return busd
  } else if (symbol.indexOf('DAI') > -1) {
    return dai
  } else if (symbol.indexOf('USD') > -1) {
    return { component: <div className='w-full h-full rounded-full bg-primary flex items-center justify-center text-xs font-light text-white'>$</div> }
  } else if (symbol.indexOf('PoD') > -1) {
    return pod
  } else if (symbol.indexOf('UCT') > -1) {
    return uct
  } else if (symbol.indexOf('sFUEL') > -1) {
    return sfuel
  } else {
    return null
  }
}

export default function TagNetworkToken ({ responsive, size = 'sm', explorer, token, iconOnly, className }) {
  if (!token) {
    return null
  }
  const icon = getTokenIcon(token.symbol)
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
        {icon?.component || <Image src={icon} alt='' />}
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