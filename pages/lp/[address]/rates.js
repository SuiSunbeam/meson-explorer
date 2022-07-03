import React, { useEffect } from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'

import { ethers } from 'ethers'

import Card, { CardTitle, CardBody } from '../../../components/Card'
import LoadingScreen, { Loading } from '../../../components/LoadingScreen'
import ListRow from '../../../components/ListRow'
import TagNetwork from '../../../components/TagNetwork'
import TagNetworkToken from '../../../components/TagNetworkToken'

import { presets, getAllNetworks } from '../../../lib/swap'

export default function LpPage() {
  const router = useRouter()
  const { address } = router.query

  let body = <CardBody><LoadingScreen /></CardBody>
  if (address) {
    // body = (
    //   <CardBody border={false}>
    //     <RatesContent address={address} />
    //   </CardBody>
    // )
  }

  return (
    <Card>
      <CardTitle
        title='LP'
        subtitle={address}
        tabs={[
          { key: 'liquidity', name: 'Liquidity', onClick: () => router.push(`/lp/${address}`) },
          { key: 'rates', name: 'Fee Rates', active: true }
        ]}
      />
        {body}
    </Card>
  )
}

function RatesContent ({ address }) {
  return null
}

function RatesContentRow ({ address, network }) {
  return (
    <ListRow
      size='sm'
      title={
        <div className='flex flex-col align-start'>
          <TagNetwork size='md' network={network} />
          <div className='flex ml-7 mt-0.5 text-xs font-mono'>
            {core}
            <div className='ml-1'>{network.nativeCurrency?.symbol || 'ETH'}</div>
          </div>
        </div>
      }
    >
    </ListRow>
  )
}

function TokenAmount ({ client, address, token, explorer }) {
}
