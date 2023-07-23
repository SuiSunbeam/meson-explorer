import classnames from 'classnames'
import Image from 'next/image'

import { ExternalIcon } from 'components/ExternalLink'
import { getExplorerAddressLink } from 'lib/swap'

import aptos from './aptos.png'
import arb from './arb.png'
import aurora from './aurora.png'
import avax from './avax.png'
import beam from './beam.png'
import bnb from './bnb.png'
import cfx from './cfx.png'
import cronos from './cronos.png'
import eos from './eos.png'
import eth from './eth.png'
import evmos from './evmos.png'
import ftm from './ftm.png'
import movr from './movr.png'
import one from './one.png'
import opt from './opt.png'
import polygon from './polygon.png'
import sepolia from './sepolia.png'
import skale from './skale.png'
import sui from './sui.png'
import tron from './tron.png'
import zkevm from './zkevm.png'
import zksync from './zksync.png'

const icons = { aptos, arb, aurora, avax, beam, bnb, cfx, cronos, eos, eth, goerli: eth, evmos, ftm, movr, one, opt, polygon, sepolia, skale, sui, tron, zkevm, zksync }

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