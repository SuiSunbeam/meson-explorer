import React from 'react'
import { useRouter } from 'next/router'

import PagiCard from 'components/Pagi/PagiCard'
import { PaidPremiumRow } from './payments'

export default function PaidPremiumList() {
  const router = useRouter()
  const addr = router.query.addr

  return (
    <PagiCard
      title='Premium for Address'
      subtitle={addr} 
      queryUrl={`admin/premium/${addr}`}
      fallback={`/premium/${addr}`}
      tableHeaders={[
        { name: 'initiator / time', width: '18%' },
        { name: 'type', width: '8%' },
        { name: 'tx hash', width: '18%' },
        { name: 'paid', width: '8%' },
        { name: 'usage', width: '15%' },
        { name: 'hide', width: '8%' },
        { name: 'valid', width: '25%' }
      ]}
      Row={props => PaidPremiumRow({ ...props, linkPrefix: 'address' })}
    />
  )
}
