import React from 'react'
import Link from 'next/link'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Table, { Td } from 'components/Table'

export default function ShareStats() {
  const { data, error } = useSWR(`share/stats`, fetcher)

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'address', width: '55%' },
        { name: 'code', width: '15%' },
        { name: 'clicks', width: '15%' },
        { name: 'posters', width: '15%' }
      ]}>
        {data.map((row, index) => <ShareStatRow key={`stat-table-row-${index}`} {...row} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle title='Share Stats' />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}

function ShareStatRow ({ _id, address, n, seq }) {

  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>
        <div className='text-sm font-mono'>
          <span className='hover:underline hover:text-primary'>
            <Link href={`/address/${address}`}>{address}</Link>
          </span>
        </div>
      </Td>
      <Td className='text-sm font-mono'>{_id}</Td>
      <Td>{n}</Td>
      <Td>{seq}</Td>
    </tr>
  )
}