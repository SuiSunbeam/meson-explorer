import React from 'react'
import Link from 'next/link'

import { abbreviate, formatDate } from 'lib/swap'

import Card, { CardTitle, CardBody } from 'components/Card'
import PagiList from 'components/PagiList'
import Table, { Td } from 'components/Table'
import Badge from 'components/Badge'

export default function RedeemedPremiumList() {
  return (
    <Card>
      <CardTitle title='Redeemed Premium' subtitle='' />
      <CardBody>
        <PagiList queryUrl='premium/redeemed' fallback='/premium/redeemed'>
          <Table headers={[
            { name: 'initiator / time', width: '30%', className: 'pl-3 md:pl-4 hidden sm:table-cell' },
            { name: 'type', width: '20%' },
            { name: 'usage', width: '20%' },
            { name: 'valid', width: '30%' }
          ]}>
            {list => list.map(row => <RedeemedPremiumRow key={row._id} {...row} />)}
          </Table>
        </PagiList>
      </CardBody>
    </Card>
  )
}

function RedeemedPremiumRow ({ initiator, paid, used, quota, since, until }) {
  const type = 'REDEEM'
  const badgeType = 'info'
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-3 md:pl-4 py-2'>
        <div className='text-primary hover:underline'>
          <Link href={`/premium/${initiator}`}>{abbreviate(initiator, 8, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(since * 1000).toLocaleString()}
        </div>
      </Td>
      <Td><Badge type={badgeType}>{type}</Badge></Td>
      <Td>
      {
        type === 'EXTRA' 
          ? <div>+{paid / 200000 + 0.05}k</div>
          : <>
              <div>{Math.floor(used / 1000_000000)}k / {quota / 1000_000000}k</div>
              <div className='text-xs text-gray-500'>{Math.floor(used/quota*1000)/10}%</div>
            </>
        
      }
      </Td>
      <Td>{type !== 'EXTRA' && `${formatDate(since * 1000)} - ${formatDate(until * 1000)}`}</Td>
    </tr>
  )
}