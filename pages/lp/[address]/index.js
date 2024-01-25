import React from 'react'
import { useRouter } from 'next/router'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'

import { EXTRA_LPS } from 'lib/const'
import { abbreviate } from 'lib/swap'
import useDealer from 'lib/useDealer'

import { LpContent } from '../components'

export default function LpPage() {
  const router = useRouter()
  const { address = '' } = router.query

  const { dealer } = useDealer()

  let body = <CardBody><LoadingScreen /></CardBody>
  if (address && dealer) {
    body = (
      <CardBody border={false}>
        <LpContent address={address} dealer={dealer} />
      </CardBody>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Liquidity Pool'
        subtitle={address && `For pool owner ${address}`}
        tabs={[
          { key: 'general', name: 'General', onClick: () => router.push(`/lp`) },
          ...EXTRA_LPS.map(lp => ({
            key: lp,
            name: abbreviate(lp, 4, 0),
            active: address === lp,
            onClick: () => router.push(`/lp/${lp}`)
          })),
          { key: 'whitelist', name: 'Whitelist', onClick: () => router.push(`/lp/whitelist`) }
        ]}
      />
      {body}
    </Card>
  )
}
