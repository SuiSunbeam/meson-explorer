import React from 'react'
import classnames from 'classnames'
import Link from 'next/link'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'
import { abbreviate } from 'lib/swap'

import { StatCard } from 'components/Card'
import PagiCard from 'components/Pagi/PagiCard'
import { Td } from 'components/Table'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'

export default function AllsToStats() {
  const { data: generalData } = useSWR(`stats/alls-to/general`, fetcher)

  return (
    <>
      <div className='grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-3 md:mb-5 mb-3'>
        <StatCard title='# of Links' value={generalData?.count} />
        <StatCard title='# of Link3' value={generalData?.link3} />
        <StatCard title='# of .bit' value={generalData?.dotbit} />
      </div>
      <PagiCard
        title='AllsTo Links'
        queryUrl='stats/alls-to'
        fallback='/stats-alls-to'
        pageSize={100}
        tableHeaders={[
          { name: 'recipient', width: '50%' },
          { name: 'link', width: '20%' },
          { name: 'did', width: '10%' },
          { name: 'clicks', width: '10%' },
          { name: 'will receive', width: '10%' }
        ]}
        Row={StatAllsToRow}
      />
    </>
  )
}

function StatAllsToRow ({ data }) {
  const { addr, key, did, name, avatar, networkId, tokens, clicks } = data
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>
        <div className='flex items-center'>
          <img className='h-5 w-5 rounded-full mr-2' src={avatar} alt='' />
          {name}
        </div>
        <div className='text-xs text-gray-500 hover:underline hover:text-primary'>
          <Link href={`/address/${addr}`}>
            {abbreviate(addr)}
          </Link>
        </div>
      </Td>
      <Td className={classnames(
        'text-sm font-mono hover:underline hover:text-primary',
        key ? '' : 'text-gray-500'
      )}>
        <a href={`https://alls.to/${key || addr.substring(0, 12)}`} target='_blank' rel='noreferrer'>
          {key || addr.substring(0, 12)}
        </a>
      </Td>
      <Td className='text-sm'>{did}</Td>
      <Td className='text-sm'>{clicks}</Td>
      <Td>
        <div className='flex items-center'>
          <TagNetwork size='md' network={{ id: networkId }} />
          <TagNetworkToken iconOnly size='md' token={{ symbol: tokens[0]?.toUpperCase() }} />
        </div>
      </Td>
    </tr>
  )
}