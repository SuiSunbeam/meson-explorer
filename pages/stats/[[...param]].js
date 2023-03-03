import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { ethers } from 'ethers'

import fetcher from 'lib/fetcher'
import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody, StatCard } from 'components/Card'
import Table, { Td } from 'components/Table'
import ButtonGroup from 'components/ButtonGroup'
import TagNetwork from 'components/TagNetwork'

import { getAllNetworks, formatDuration } from 'lib/swap'

const fmt = Intl.NumberFormat()

export default function StatsByChain() {
  const tabs = getAllNetworks().map(n => ({
    key: n.id,
    name: n.name,
    display: <TagNetwork size='md' network={n} iconOnly />,
    shortCoinType: n.shortSlip44
  }))
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
  const { data: generalData } = useSWR(`stats/general`, fetcher)
  const { data, error } = useSWR(req, fetcher)

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const total = data.reduce(({ count, success, apiCount, apiSuccess, m2Count, m2Success, a2Count, a2Success, srFee, lpFee }, row) => ({
      count: row.count + count,
      success: row.success + success,
      apiCount: row.apiCount + apiCount,
      apiSuccess: row.apiSuccess + apiSuccess,
      m2Count: row.m2Count + m2Count,
      m2Success: row.m2Success + m2Success,
      a2Count: row.a2Count + a2Count,
      a2Success: row.a2Success + a2Success,
      srFee: row.srFee + srFee,
      lpFee: row.lpFee + lpFee,
      duration: 0
    }), { count: 0, success: 0, apiCount: 0, apiSuccess: 0, m2Count: 0, m2Success: 0, a2Count: 0, a2Success: 0, srFee: 0, lpFee: 0, duration: 0 })
    body = (
      <Table
        size='lg'
        headers={[
          { name: 'Date', width: '10%' },
          { name: '# success / total', width: '15%' },
          { name: '# API swaps', width: '10%' },
          { name: '# meson.to swaps', width: '10%' },
          { name: '# alls.to swaps', width: '10%' },
          { name: 'Volume', width: '12%' },
          { name: 'Addrs', width: '8%' },
          { name: 'Service | LP Fee', width: '10%' },
          { name: 'Avg. Amount', width: '8%' },
          { name: 'Avg. Dur.', width: '7%' }
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
        <StatCard title='Total Volume' value={volume ? `$${fmt.format(Math.floor(ethers.utils.formatUnits(volume, 6)))}` : 'N/A'} />
        <StatCard title='Avg. Duration' value={duration ? formatDuration(duration * 1000) : 'N/A'} />
      </div>

      <Card>
        <CardTitle
          title='Stats for Swaps'
          badge={shortCoinType &&
            <ButtonGroup
              size='sm'
              active={type}
              buttons={[
                { key: 'both', text: `All` },
                { key: 'from', text: `From` },
                { key: 'to', text: `To` }
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

function formatFee (feeValue) {
  const feeAmount = Math.floor(ethers.utils.formatUnits(feeValue || 0, 6))
  if (feeAmount > 10000) {
    return Math.floor(feeAmount / 1000) + 'k'
  }
  return fmt.format(feeAmount)
}

function SwapCount({ count, success }) {
  if (!count) {
    return null
  }
  const countStr = count > 10000 ? Math.floor(count / 1000) + 'k' : count
  const successStr = success > 10000 ? Math.floor(success / 1000) + 'k' : success
  return <>{successStr} <span className='text-gray-500'>/</span> {countStr} <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span></>
}

function StatTableRow({ _id: date, count, success, apiCount, apiSuccess, m2Count, m2Success, a2Count, a2Success, volume, srFee, lpFee, addresses, duration }) {
  const volumeStr = volume ? `$${fmt.format(Math.floor(ethers.utils.formatUnits(volume, 6)))}` : ''
  const srFeeStr = formatFee(srFee)
  const lpFeeStr = formatFee(lpFee)
  const avgSwapAmount = (success && volume) ? `$${fmt.format(Math.floor(ethers.utils.formatUnits(Math.floor(volume / success), 6)))}` : ''

  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='lg'>{date}</Td>
      <Td><SwapCount count={count} success={success} /></Td>
      <Td><SwapCount count={apiCount} success={apiSuccess} /></Td>
      <Td><SwapCount count={m2Count} success={m2Success} /></Td>
      <Td><SwapCount count={a2Count} success={a2Success} /></Td>
      <Td>{volumeStr}</Td>
      <Td>{addresses}</Td>
      <Td>${srFeeStr} <span className='text-gray-500'>|</span> ${lpFeeStr}</Td>
      <Td>{avgSwapAmount}</Td>
      <Td>{formatDuration(duration * 1000)}</Td>
    </tr>
  )
}