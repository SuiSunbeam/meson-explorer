import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'

import PagiCard from 'components/Pagi/PagiCard'
import Badge from 'components/Badge'
import { PaidPremiumRow } from './list'

export default function PaidPremiumList() {
  const router = useRouter()
  const addr = router.query.addr

  const { data, error } = useSWR(`premium/${addr}`, fetcher)

  return (
    <PagiCard
      title='Premium for Address'
      subtitle={
        !data ? addr :
        <div>
          {data.address.map(addr => <div key={addr} className='flex items-center'><Badge type='info' className='mr-1'>{addr.split(':')[0]}</Badge>{addr.split(':')[1]}</div>)}
          {data.params?.hide && <div className='mt-1'><Badge type='warning'>HIDE</Badge></div>}
        </div>
      } 
      queryUrl={`admin/premium/${addr}`}
      fallback={`/premium/${addr}`}
      tableHeaders={[
        { name: 'address / period', width: '20%' },
        { name: 'plan', width: '10%' },
        { name: 'usage / quota', width: '20%' },
        { name: 'paid', width: '15%' },
        { name: 'saved', width: '15%' },
        { name: 'txs', width: '20%' },
      ]}
      Row={props => PaidPremiumRow({ ...props, linkPrefix: 'address' })}
    />
  )
}
