import React from 'react'
import classnames from 'classnames'
import Link from 'next/link'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'
import { abbreviate } from 'lib/swap'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Table, { Td } from 'components/Table'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'

export default function AllsToStats() {
  const { data, error } = useSWR(`stats/alls-to`, fetcher)

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'recipient', width: '50%' },
        { name: 'link', width: '30%' },
        { name: 'will receive', width: '20%' },
      ]}>
        {data.map((row, index) => <StatAllsToRow key={`stat-table-row-${index}`} {...row} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle title='Stats for AllsTo' />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}

function StatAllsToRow ({ _id, uid, name, avatar, networkId, tokens }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>
        <div className='flex items-center'>
          <img className='h-5 w-5 rounded-full mr-2' src={avatar} alt='' />
          {name}
        </div>
        <div className='text-xs text-gray-500'>
          {abbreviate(_id)}
        </div>
      </Td>
      <Td className={classnames(
        'text-sm font-mono hover:underline hover:text-primary',
        uid ? '' : 'text-gray-500'
      )}>
        <Link href={`https://alls.to/${uid || _id.substring(0, 12)}`}>
          {uid || _id.substring(0, 12)}
        </Link>
      </Td>
      <Td>
        <div className='flex items-center'>
          <TagNetwork size='md' network={{ id: networkId }} />
          <TagNetworkToken iconOnly size='md' token={{ symbol: tokens[0]?.toUpperCase() }} />
        </div>
      </Td>
    </tr>
  )
}