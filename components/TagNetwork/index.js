import Image from 'next/image'

import { ExternalIcon } from '../ExternalLink'

import eth from './eth.png'
import bnb from './bnb.png'
import ava from './ava.png'
import matic from './matic.png'
import ftm from './ftm.png'
import one from './one.png'
import cfx from './cfx.png'

const logos = { eth, bnb, ava, matic, ftm, one, cfx }

export default function TagNetwork ({ network, address }) {
  const logo = logos[network.alias?.toLowerCase()]
  return (
    <div className='flex items-center text-xs text-gray-500'>
      <div className='flex itmes-center w-4 h-4 mr-1'>
        {logo && <Image src={logo} alt='' />}
      </div>
      {network.networkName}
      {address && <ExternalIcon href={`${network.explorer}/address/${address}`} />}
    </div>
  )
}