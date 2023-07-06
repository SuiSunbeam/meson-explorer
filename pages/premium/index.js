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
    const total = data.reduce(({ premium, plus, lite, extra }, row) => ({
      premium: row.premium + premium,
      plus: row.plus + plus,
      lite: row.lite + lite,
      extra: row.extra + extra
    }), { premium: 0, plus: 0, lite: 0, extra: 0 })
    body = (
      <Table size='lg' headers={[
        { name: 'date', width: '28%' },
        { name: 'premium', width: '18%' },
        { name: 'plus', width: '18%' },
        { name: 'lite', width: '18%' },
        { name: 'extra', width: '18%' }
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

function StatPremiumRow ({ _id: date, premium, plus, lite, extra }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>{date}</Td>
      <Td>{premium}</Td>
      <Td>{plus}</Td>
      <Td>{lite}</Td>
      <Td>{extra}</Td>
    </tr>
  )
}