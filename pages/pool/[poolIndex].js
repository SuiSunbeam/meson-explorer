import React from 'react'
import { useRouter } from 'next/router'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Button from 'components/Button'

import fetcher from 'lib/fetcher'
import { abbreviate, getAllNetworks } from 'lib/swap'
import useDealer from 'lib/useDealer'

import { LpContent } from '../lp/components'

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
const NETWORKS = [
  'eth', 'bnb', 'polygon', 'arb', 'opt', 'tron', 'cfx'
]

export default function PoolPage() {
  const router = useRouter()
  const poolIndex = Number(router.query.poolIndex)
  const [addressByNetwork, setAddressByNetwork] = React.useState(null)

  const dealer = useDealer()
  React.useEffect(() => {
    if (!dealer) {
      return
    }
    Promise.all(getAllNetworks().filter(n => NETWORKS.includes(n.id)).map(async network => {
      const mesonClient = dealer._createMesonClient({
        id: network.id,
        url: network.url.replace('${INFURA_API_KEY}', process.env.NEXT_PUBLIC_INFURA_PROJECT_ID)
      })
      return [network.id, await mesonClient.ownerOfPool(poolIndex).catch(e => {})]
    })).then(owners => {
      const addressByNetwork = Object.fromEntries(
        owners.filter(item => item[1] && item[1] !== ADDRESS_ZERO)
      )
      setAddressByNetwork(addressByNetwork)
    })
  }, [dealer, poolIndex])

  let body = <CardBody><LoadingScreen /></CardBody>
  if (dealer && addressByNetwork) {
    body = (
      <CardBody border={false} className='overflow-x-auto'>
        <LpContent noColor withSrFee={false} addressByNetwork={addressByNetwork} dealer={dealer} />
      </CardBody>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Liquidity Pool'
        subtitle={`Pool Index: ${poolIndex}`}
      />
      {body}
    </Card>
  )
}
