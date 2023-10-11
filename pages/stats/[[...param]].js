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
  const router = useRouter()
  const { token = '', param } = router.query
  const chain = param ? param[0] : 'all'
  const type = (param && param[1]) || 'both'
  const tabs = React.useMemo(() => [
    { key: 'all', name: 'All Chains', shortCoinType: '' },
    ...getAllNetworks().map(n => ({
      key: n.id,
      name: n.name,
      display: <TagNetwork size='md' network={n} iconOnly />,
      shortCoinType: n.shortSlip44
    }))
  ], [])


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
  if (token) {
    req += `?token=${token}`
  }
  const { data: generalData } = useSWR(`stats/general`, fetcher)
  const { data, error } = useSWR(req, fetcher)

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const init = {
      count: 0,
      success: 0,
      api: { count: 0, success: 0 },
      auto: { count: 0, success: 0 },
      m2: { count: 0, success: 0 },
      a2: { count: 0, success: 0 },
      volume: 0,
      srFee: 0,
      lpFee: 0,
    }
    const total = data.reduce(({ count, success, api, auto, m2, a2, volume, srFee, lpFee }, prev) => ({
      count: (prev.count || 0) + count,
      success: prev.success + success,
      api: { count: prev.api.count + api.count, success: prev.api.success + api.success },
      auto: { count: prev.auto.count + auto.count, success: prev.auto.success + auto.success },
      m2: { count: prev.m2.count + m2.count, success: prev.m2.success + m2.success },
      a2: { count: prev.a2.count + a2.count, success: prev.a2.success + a2.success },
      volume: prev.volume + volume,
      srFee: prev.srFee + srFee,
      lpFee: prev.lpFee + lpFee,
      duration: 0
    }), init)
    body = (
      <Table
        size='lg'
        headers={[
          { name: 'Date', width: '10%' },
          { name: '# success / total', width: '15%' },
          { name: '# API swaps', width: '10%' },
          { name: '# Auto swaps', width: '10%' },
          { name: '# meson.to swaps', width: '10%' },
          { name: '# alls.to swaps', width: '10%' },
          { name: 'Addrs', width: '8%' },
          ...(token && [
            { name: 'Volume', width: '12%' },
            { name: 'Service | LP Fee', width: '10%' },
            { name: 'Avg. Amount', width: '8%' },
          ]),
          { name: 'Avg. Dur.', width: '7%' }
        ]}
      >
        <StatTableRow _id='Total' token={token} {...total} />
        {data.map((row, index) => <StatTableRow key={`stat-table-row-${index}`} token={token} {...row} />)}
      </Table>
    )
  }

  const { success, count, volume, duration, addresses } = generalData || {}
  const nSuccess = success ? fmt.format(success) : '-'
  const nTotal = count ? fmt.format(count) : '-'
  const rate = (success > 1 && count > 1) ? <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span> : ''

  const updatePathname = React.useCallback((chain, type, token) => {
    let pathname = `/stats`
    if (chain && chain !== 'all') {
      pathname += `/${chain}`
      if (type !== 'both') {
        pathname += `/${type}`
      }
    }
    if (token) {
      pathname += `?token=${token}`
    }
    router.push(pathname)
  }, [router])

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
              onChange={type => updatePathname(chain, type, token)}
            />
          }
          right={
            <ButtonGroup
              size='sm'
              active={token}
              buttons={[
                { key: '', text: `All` },
                { key: 'usd', text: `Stablecoins` },
                { key: 'eth', text: `ETH` },
                { key: 'bnb', text: `BNB` },
              ]}
              onChange={token => updatePathname(chain, type, token)}
            />
          }
          tabs={tabs.map(t => ({
            ...t,
            active: t.key === chain,
            onClick: () => updatePathname(t.key, type, token)
          }))}
        />
        <CardBody>
          {body}
        </CardBody>
      </Card>
    </>
  )
}

function valueInStr (value = 0, symbol, k = false) {
  if (symbol === 'eth') {
    return `${fmt.format(ethers.utils.formatUnits(value, 6))}♢`
  } else if (symbol === 'bnb') {
    return `${fmt.format(ethers.utils.formatUnits(value, 6))}`
  }
  const amount = Math.floor(ethers.utils.formatUnits(value, 6))
  if (k && amount > 10000) {
    return `$${Math.floor(amount / 1000)}k`
  }
  return `$${fmt.format(amount)}`
}

function SwapCount({ count, success }) {
  if (!count) {
    return null
  }
  const countStr = count > 10000 ? Math.floor(count / 1000) + 'k' : count
  const successStr = success > 10000 ? Math.floor(success / 1000) + 'k' : success
  return <>{successStr} <span className='text-gray-500'>/</span> {countStr} <span className='text-gray-500 text-sm'>({Math.floor(success / count * 1000) / 10}%)</span></>
}

function StatTableRow({ _id: date, token, count, success, api, auto, m2, a2, volume = 0, srFee, lpFee, addresses, duration }) {
  const volumeStr = valueInStr(volume, token)
  const srFeeStr = valueInStr(srFee, token, true)
  const lpFeeStr = valueInStr(lpFee, token, true)
  const avgSwapAmount = success ? valueInStr(Math.floor(volume / success), token) : ''

  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm'>{date}</Td>
      <Td size='sm'><SwapCount count={count} success={success} /></Td>
      <Td size='sm'><SwapCount {...api} /></Td>
      <Td size='sm'><SwapCount {...auto} /></Td>
      <Td size='sm'><SwapCount {...m2} /></Td>
      <Td size='sm'><SwapCount {...a2} /></Td>
      <Td size='sm'>{addresses}</Td>
      {
        token &&
        <>
          <Td size='sm'>{volumeStr}</Td>
          <Td size='sm'>{srFeeStr} <span className='text-gray-500'>|</span> {lpFeeStr}</Td>
          <Td size='sm'>{avgSwapAmount}</Td>
        </>
      }
      <Td size='sm'>{formatDuration(duration * 1000)}</Td>
    </tr>
  )
}