import classnames from 'classnames'
import Image from 'next/image'

import { ExternalIcon } from 'components/ExternalLink'
import { getExplorerAddressLink } from 'lib/swap'

import ancient8 from './ancient8.png'
import aptos from './aptos.png'
import arb from './arb.png'
import aurora from './aurora.png'
import avax from './avax.png'
import base from './base.png'
import beam from './beam.png'
import bnb from './bnb.png'
import cfx from './cfx.png'
import cronos from './cronos.png'
import eos from './eos.png'
import eth from './eth.png'
import evmos from './evmos.png'
import ftm from './ftm.png'
import linea from './linea.png'
import manta from './manta.png'
import movr from './movr.png'
import one from './one.png'
import opt from './opt.png'
import polygon from './polygon.png'
import scroll from './scroll.png'
import sepolia from './sepolia.png'
import skale from './skale.png'
import sui from './sui.png'
import tron from './tron.png'
import zkevm from './zkevm.png'
import zksync from './zksync.png'

const icons = { ancient8, aptos, arb, aurora, avax, base, beam, bnb, cfx, cronos, eos, eth, goerli: eth, evmos, ftm, linea, manta, movr, one, opt, polygon, scroll, sepolia, skale, sui, tron, zkevm, zksync }

export default function TagNetwork ({ responsive, size = 'sm', network, iconOnly, address, className }) {
  const id = network.id.split('-')[0]
  const icon = icons[id]
  return (
    <div className={classnames('flex items-center text-gray-500', size === 'sm' && 'text-xs', className)}>
      <div className={classnames('flex items-center rounded-full shadow', size === 'md' ? 'w-5 h-5' : 'w-4 h-4')}>
        {icon && <Image src={icon} alt='' />}
      </div>
      {
        !iconOnly &&
        <div className={classnames('items-center', size === 'md' ? 'ml-2' : 'ml-1', responsive ? 'hidden sm:flex' : 'flex')}>
          {network.name}
          {address && <ExternalIcon href={getExplorerAddressLink(network, address)} />}
        </div>
      }
    </div>
  )
}