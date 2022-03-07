import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody, StatCard } from '../../components/Card'
import Table, { Td } from '../../components/Table'

const fetcher = async chain => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/stats/${chain}`)
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

const tabs = [
  { key: 'all', name: 'All Chains' },
  { key: 'bsc', name: 'BSC' },
  { key: 'ava', name: 'Avalanche' },
  { key: 'polygon', name: 'Polygon' },
  { key: 'ftm', name: 'Fantom' },
]

export default function StatsByChain() {
  const router = useRouter()
  const { chain } = router.query

  React.useEffect(() => {
    if (!tabs.find(t => t.key === chain)) {
      router.replace('/stats/all')
    }
  }, [router])

  const { data, error } = useSWR(chain, fetcher)

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table headers={[
        { name: 'Date', className: 'pl-4 sm:pl-6' },
        { name: 'Count' }, { name: 'Volume' }, { name: 'Success' }, { name: 'Duration' }
      ]}>
        {data.map((row, index) => <StatTableRow key={`stat-table-row-${index}`} {...row} />)}
      </Table>
    )
  }

  return (
    <>
      <div className='grid grid-cols-3 md:gap-5 gap-3 md:mb-5 mb-3'>
        <StatCard title='Swap Count' value='N/A' />
        <StatCard title='Swap Amounts' value='N/A' />
        <StatCard title='Avg. Duration' value='N/A' />
      </div>

      <Card>
        <CardTitle
          title='Stats'
          tabs={tabs.map(t => ({ ...t, active: t.key === chain, onClick: () => router.push(`/stats/${t.key}`) }))}
        />
        <CardBody>
          {body}
        </CardBody>
      </Card>
    </>
  )
}

function StatTableRow({ date, count, vol, success, duration }) {
  return (
    <tr>
      <Td  className='pl-4 pr-3 sm:pl-6'>{date}</Td>
      <Td>{count}</Td>
      <Td>${vol}</Td>
      <Td>{success}</Td>
      <Td>{duration}</Td>
    </tr>
  )
}