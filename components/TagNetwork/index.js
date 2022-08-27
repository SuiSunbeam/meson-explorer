import classnames from 'classnames'
import Image from 'next/image'

import { ExternalIcon } from 'components/ExternalLink'

import eth from './eth.png'
import bnb from './bnb.png'
import avax from './avax.png'
import polygon from './polygon.png'
import ftm from './ftm.png'
import arb from './arb.png'
import opt from './opt.png'
import one from './one.png'
import aurora from './aurora.png'
import cfx from './cfx.png'
import evmos from './evmos.png'
import movr from './movr.png'
import beam from './beam.png'
import tron from './tron.png'

const logos = { eth, ropsten: eth, bnb, avax, polygon, ftm, arb, opt, one, aurora, cfx, evmos, movr, beam, tron }

export default function TagNetwork ({ responsive, size = 'sm', network, iconOnly, address, className }) {
  const id = (network.id || network.networkId).split('-')[0]
  const logo = logos[id]
  return (
    <div className={classnames('flex items-center text-gray-500', size === 'sm' && 'text-xs', className)}>
      <div className={classnames('flex items-center rounded-full shadow', size === 'md' ? 'w-5 h-5' : 'w-4 h-4')}>
        {logo && <Image src={logo} alt='' />}
      </div>
      {
        !iconOnly &&
        <div className={classnames('items-center', size === 'md' ? 'ml-2' : 'ml-1', responsive ? 'hidden sm:flex' : 'flex')}>
          {network.networkName || network.name}
          {address && <ExternalIcon href={`${network.explorer}/address/${address}`} />}
        </div>
      }
     
    </div>
  )
}