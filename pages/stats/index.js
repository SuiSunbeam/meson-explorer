import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { ethers } from 'ethers'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody, StatCard } from '../../components/Card'
import Table, { Td } from '../../components/Table'
import ButtonGroup from '../../components/ButtonGroup'

import { getAllNetworks, getDuration } from '../../lib/swap'

const fetcher = async query => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/stats?${query}`)
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

export default function StatsByChain() {
  const tabs = getAllNetworks().map(n => ({ key: n.id, name: n.name, shortCoinType: n.shortSlip44 }))
  tabs.unshift({ key: 'all', name: 'All Chains', shortCoinType: '' })

  const router = useRouter()
  const { from, to } = router.query
  const key = from || to || 'all'
  const type = to ? 'to' : 'from'

  const selected = tabs.find(t => t.key === key) || {}
  const { name, shortCoinType } = selected

  React.useEffect(() => {
    if (typeof shortCoinType === 'undefined' || (from && key === 'all')) {
      router.replace('/stats')
    } else if (from && to) {
      router.replace(`/stats?from=${from}`)
    }
  }, [router])

  const { data, error } = useSWR(`${type}=${shortCoinType}`, fetcher)

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table headers={[
        { name: 'Date', width: '25%', className: 'pl-4 sm:pl-6' },
        { name: 'Count', width: '15%' },
        { name: 'Volume', width: '20%' },
        { name: 'Success', width: '20%' },
        { name: 'Duration', width: '20%' }
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
          badge={shortCoinType &&
            <ButtonGroup
              size='sm'
              active={type}
              buttons={[{ key: 'from', text: `From ${name}` }, { key: 'to', text: `To ${name}` }]}
              onChange={type => router.push(`/stats?${type}=${key}`)}
            />
          }
          tabs={tabs.map(t => ({
            ...t,
            active: t.key === key,
            onClick: () => router.push(t.key === 'all' ? '/stats' : `/stats?${type}=${t.key}`)
          }))}
        />
        <CardBody>
          {body}
        </CardBody>
      </Card>
    </>
  )
}

function StatTableRow({ _id: date, count, volume, success, duration }) {
  return (
    <tr>
      <Td  className='pl-4 pr-3 sm:pl-6'>{date}</Td>
      <Td>{count}</Td>
      <Td>${ethers.utils.formatUnits(volume, 6)}</Td>
      <Td>{success} <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span></Td>
      <Td>{getDuration(duration * 1000)}</Td>
    </tr>
  )
}