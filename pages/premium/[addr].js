import React from 'react'
import { useRouter } from 'next/router'

import Card, { CardTitle, CardBody } from 'components/Card'
import PagiList from 'components/PagiList'
import Table from 'components/Table'

import { PaidPremiumRow } from './index'

export default function PaidPremiumList() {
  const router = useRouter()
  const addr = router.query.addr
  
  return (
    <Card>
      <CardTitle title='Paid Premium' subtitle={addr} />
      <CardBody>
        <PagiList queryUrl={`premium/${addr}`} fallback={`/premium/${addr}`}>
          <Table headers={[
            { name: 'initiator / time', width: '20%', className: 'pl-3 md:pl-4 hidden sm:table-cell' },
            { name: 'type', width: '10%' },
            { name: 'tx hash', width: '20%' },
            { name: 'paid', width: '10%' },
            { name: 'usage', width: '15%' },
            { name: 'valid', width: '25%' }
          ]}>
            {list => list.map(row => <PaidPremiumRow key={row._id} linkPrefix='address' {...row} />)}
          </Table>
        </PagiList>
      </CardBody>
    </Card>
  )
}
