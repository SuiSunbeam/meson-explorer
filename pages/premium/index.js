import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'

import Card, { CardTitle, CardBody, StatCard } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Table, { Td } from 'components/Table'

export default function StatsPremium() {
  const router = useRouter()
  const { data, error } = useSWR(`stats/premium`, fetcher)
  const { data: generalData } = useSWR(`admin/premium/general`, fetcher)

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const total = data.reduce(({ buy, extra, renew, redeem }, row) => ({
      buy: row.buy + buy,
      extra: row.extra + extra,
      renew: row.renew + renew,
      redeem: row.redeem + redeem
    }), { buy: 0, extra: 0, renew: 0, redeem: 0 })
    body = (
      <Table size='lg' headers={[
        { name: 'date', width: '28%' },
        { name: 'buy', width: '18%' },
        { name: 'extra', width: '18%' },
        { name: 'renew', width: '18%' },
        { name: 'redeem', width: '18%' }
      ]}>
        <StatPremiumRow _id='Total' {...total} />
        {data.map((row, index) => <StatPremiumRow key={`stat-table-row-${index}`} {...row} />)}
      </Table>
    )
  }

  return (
    <>
      <div className='grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-3 md:mb-5 mb-3'>
        <StatCard title='# of Current Premium' value={generalData?.current || 'N/A'} />
        <StatCard title='# of Past Premium' value={generalData?.total || 'N/A'} />
      </div>
      <Card>
        <CardTitle
          title='Premiums'
          tabs={[
            { key: 'stats', name: 'Daily Stats', active: true },
            { key: 'list', name: 'List', onClick: () => router.push('/premium/list') },
            { key: 'redeem', name: 'Redeems', onClick: () => router.push('/premium/redeem') },
            { key: 'giveaway', name: 'Give Aways', onClick: () => router.push('/premium/give-away') }
          ]}
        />
        <CardBody>
          {body}
        </CardBody>
      </Card>
    </>
  )
}

function StatPremiumRow ({ _id: date, buy, extra, renew, redeem }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>{date}</Td>
      <Td>{buy}</Td>
      <Td>{extra}</Td>
      <Td>{renew}</Td>
      <Td>{redeem}</Td>
    </tr>
  )
}