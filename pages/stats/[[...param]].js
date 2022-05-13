import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { ethers } from 'ethers'

import fetch from '../../lib/fetch'
import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody, StatCard } from '../../components/Card'
import Table, { Td } from '../../components/Table'
import ButtonGroup from '../../components/ButtonGroup'

import { getAllNetworks, formatDuration } from '../../lib/swap'

const authorizedEmails = process.env.NEXT_PUBLIC_AUTHORIZED.split(';')
const fmt = Intl.NumberFormat()

export default function AuthWrapper() {
  const { data: session } = useSession()

  if (!session?.user) {
    return 'Need login'
  }

  if (!authorizedEmails.includes(session.user.email)) {
    return 'Unauthorized'
  }

  return <StatsByChain />
}

const generalFetcher = async () => {
  const res = await fetch(`api/v1/general`)
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

const fetcher = async req => {
  const res = await fetch(`api/v1/${req}`)
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

function StatsByChain() {
  const tabs = getAllNetworks().map(n => ({ key: n.id, name: n.name, shortCoinType: n.shortSlip44 }))
  tabs.unshift({ key: 'all', name: 'All Chains', shortCoinType: '' })

  const router = useRouter()
  const { param } = router.query

  const chain = param ? param[0] : 'all'
  const type = (param && param[1]) || 'both'

  const selected = tabs.find(t => t.key === chain) || {}
  const { name, shortCoinType } = selected

  React.useEffect(() => {
    if (param && !shortCoinType) {
      router.replace('/stats')
    } else if (!['from', 'to', 'both'].includes(type)) {
      // router.replace(`/stats/${key}`)
    }
  })

  let req = 'stats'
  if (chain !== 'all') {
    req += `/${shortCoinType}`
    if (type !== 'both') {
      req += `/${type}`
    }
  }
  const { data: generalData } = useSWR(`general`, generalFetcher)
  const { data, error } = useSWR(req, fetcher)

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const total = data.reduce(({ count, volume, fee, success }, row) => ({
      count: row.count + count,
      volume: row.volume + volume,
      fee: row.fee + fee,
      success: row.success + success,
      duration: 0
    }), { count: 0, volume: 0, fee: 0, success: 0, duration: 0 })
    body = (
      <Table
        size='lg'
        headers={[
          { name: 'Date', width: '15%' },
          { name: '# success / #  total', width: '20%' },
          { name: 'Addrs', width: '10%' },
          { name: 'Volume', width: '15%' },
          { name: 'Total Fee', width: '10%' },
          { name: 'Avg. Swap Amount', width: '15%' },
          { name: 'Avg. Duration', width: '15%' }
        ]}
      >
        <StatTableRow _id='Total' {...total} />
        {data.map((row, index) => <StatTableRow key={`stat-table-row-${index}`} {...row} />)}
      </Table>
    )
  }

  const { success, count, volume, duration, addresses } = generalData || {}
  const nSuccess = success ? fmt.format(success) : '-'
  const nTotal = count ? fmt.format(count) : '-'
  const rate = (success > 1 && count > 1) ? <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span> : ''

  return (
    <>
      <div className='grid md:grid-cols-4 grid-cols-2 md:gap-5 gap-3 md:mb-5 mb-3'>
        <StatCard title='# of Swaps' value={<>{nSuccess} / {nTotal} {rate}</>} />
        <StatCard title='# of Addresses' value={addresses || 'N/A'} />
        <StatCard title='Total Volume' value={volume ? `$${fmt.format(ethers.utils.formatUnits(volume, 6))}` : 'N/A'} />
        <StatCard title='Avg. Duration' value={duration ? formatDuration(duration * 1000) : 'N/A'} />
      </div>

      <Card>
        <CardTitle
          title='Stats'
          badge={shortCoinType &&
            <ButtonGroup
              size='sm'
              active={type}
              buttons={[
                { key: 'both', text: `All` },
                { key: 'from', text: `From ${name}` },
                { key: 'to', text: `To ${name}` }
              ]}
              onChange={type => router.push(`/stats/${chain}${type === 'both' ? '' : `/${type}`}`)}
            />
          }
          tabs={tabs.map(t => ({
            ...t,
            active: t.key === chain,
            onClick: () => router.push(t.key === 'all' ? '/stats' : `/stats/${t.key}`)
          }))}
        />
        <CardBody>
          {body}
        </CardBody>
      </Card>
    </>
  )
}

function StatTableRow({ _id: date, count, volume, fee, success, addresses, duration }) {
  const vol = fmt.format(Math.floor(ethers.utils.formatUnits(volume, 6)))
  const fee2 = fmt.format(Math.floor(ethers.utils.formatUnits(fee || 0, 6)))
  const avgSwapAmount = success ? fmt.format(Math.floor(ethers.utils.formatUnits(Math.floor(volume / success), 6))) : '-'
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>{date}</Td>
      <Td>{success} / {count} <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span></Td>
      <Td>{addresses}</Td>
      <Td>${vol}</Td>
      <Td>${fee2}</Td>
      <Td>${avgSwapAmount}</Td>
      <Td>{formatDuration(duration * 1000)}</Td>
    </tr>
  )
}