import React from 'react'
import { useRouter } from 'next/router'

import PagiCard from 'components/Pagi/PagiCard'
import { PaidPremiumRow } from './index'

export default function PaidPremiumList() {
  const router = useRouter()
  const addr = router.query.addr

  return (
    <PagiCard
      title='Paid Premium'
      subtitle={addr} 
      queryUrl={`premium/${addr}`}
      fallback={`/premium/${addr}`}
      tableHeaders={[
        { name: 'initiator / time', width: '20%' },
        { name: 'type', width: '10%' },
        { name: 'tx hash', width: '20%' },
        { name: 'paid', width: '10%' },
        { name: 'usage', width: '15%' },
        { name: 'valid', width: '25%' }
      ]}
      Row={props => PaidPremiumRow({ ...props, linkPrefix: 'address' })}
    />
  )
}
