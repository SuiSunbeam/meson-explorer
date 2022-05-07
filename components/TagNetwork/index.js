import classnames from 'classnames'
import Image from 'next/image'

import { ExternalIcon } from '../ExternalLink'

import eth from './eth.png'
import bnb from './bnb.png'
import ava from './ava.png'
import matic from './matic.png'
import ftm from './ftm.png'
import one from './one.png'
import aurora from './aurora.png'
import cfx from './cfx.png'
import evmos from './evmos.png'
import trx from './trx.png'

const logos = { eth, bnb, ava, matic, ftm, one, aurora, cfx, evmos, trx }

export default function TagNetwork ({ responsive, network, address }) {
  const logo = logos[network.networkAlias?.toLowerCase()]
  return (
    <div className='flex items-center text-xs text-gray-500'>
      <div className='flex itmes-center w-4 h-4 mr-1'>
        {logo && <Image src={logo} alt='' />}
      </div>
      <div className={classnames('items-center', responsive ? 'hidden sm:flex' : 'flex')}>
        {network.networkName}
        {address && <ExternalIcon href={`${network.explorer}/address/${address}`} />}
      </div>
    </div>
  )
}