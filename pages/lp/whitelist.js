import React from 'react'
import { useRouter } from 'next/router'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Button from 'components/Button'

import { LPS } from 'lib/const'
import { abbreviate } from 'lib/swap'

export default function LpWhitelist() {
  const router = useRouter()

  let body = <CardBody><LoadingScreen /></CardBody>
  if (false) {
    body = (
      <CardBody border={false}>
        whitelist
      </CardBody>
    )
  }

  const newAddrToWhitelist = async () => {
  }

  return (
    <Card>
      <CardTitle
        title='Liquidity Providers'
        subtitle='Addresses allowed to join liquidity providing'
        tabs={[
          ...LPS.map(lp => ({
            key: lp,
            name: abbreviate(lp, 4, 0),
            onClick: () => router.push(`/lp/${lp}`)
          })),
          { key: 'whitelist', name: 'Whitelist', active: true }
        ]}
        right={
          <Button size='sm' color='info' rounded onClick={() => newAddrToWhitelist()}>New</Button>
        }
      />
      {body}
    </Card>
  )
}