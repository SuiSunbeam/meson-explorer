import Image from 'next/image'

import { ExternalIcon } from '../ExternalLink'

import eth from './eth.png'
import bnb from './bnb.png'
import avax from './avax.png'
import polygon from './polygon.png'
import ftm from './ftm.png'
import one from './one.png'

const logos = { ropsten: eth, eth, bnb, avax, polygon, ftm, one }

export default function TagNetwork ({ network, address }) {
  const logo = logos[network.networkId.split('-')[0]]
  return (
    <div className='flex items-center text-xs text-gray-500'>
      <div className='w-4 h-4 mr-1'>
        {logo && <Image src={logo} alt='' />}
      </div>
      {network.networkName}
      {address && <ExternalIcon href={`${network.explorer}/address/${address}`} />}
    </div>
  )
}