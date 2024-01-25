import React from 'react'
import { useRouter } from 'next/router'

import PagiCard from 'components/Pagi/PagiCard'
import ButtonGroup from 'components/ButtonGroup'
import TagNetwork from 'components/TagNetwork'

import { getAllNetworks } from 'lib/swap'

import { StatTableRow } from './components'

export default function MonthlyStats() {
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
      router.replace('/stats/monthly')
    } else if (!['from', 'to', 'both'].includes(type)) {
      // router.replace(`/stats/${key}`)
    }
  })

  const queryUrl = React.useMemo(() => {
    let queryUrl = 'stats/monthly'
    if (chain !== 'all') {
      queryUrl += `/${shortCoinType}`
      if (type !== 'both') {
        queryUrl += `/${type}`
      }
    }
    if (token) {
      queryUrl += `?token=${token}`
    }
    return queryUrl
  }, [chain, shortCoinType, type, token])

  const updatePathname = React.useCallback((chain, type, token) => {
    let pathname = `/stats/monthly`
    if (chain && chain !== 'all') {
      pathname += `/${chain}`
      if (type !== 'both') {
        pathname += `/${type}`
      }
    }
    const { param, ...query } = router.query
    if (token) {
      query.token = token
    } else {
      delete query.token
    }
    router.push({ pathname, query })
  }, [router])

  const StatTableRowByToken = React.useCallback(({ data }) => StatTableRow({ data, token }), [token])

  const reducer = (_prev, item) => {
    const prev = _prev || {}
    const { count, api, auto, m2, vol_usd, fee_usd, vol_btc, fee_btc, vol_eth, fee_eth, vol_bnb, fee_bnb } = item
    return {
      _id: 'Total',
      count: (prev.count || 0) + count,
      api: (prev.api || 0) + api,
      auto: (prev.auto || 0) + auto,
      m2: (prev.m2 || 0) + m2,
      vol_usd: (prev.vol_usd || 0) + vol_usd,
      fee_usd: (prev.fee_usd || 0) + fee_usd,
      vol_btc: (prev.vol_btc || 0) + vol_btc,
      fee_btc: (prev.fee_btc || 0) + fee_btc,
      vol_eth: (prev.vol_eth || 0) + vol_eth,
      fee_eth: (prev.fee_eth || 0) + fee_eth,
      vol_bnb: (prev.vol_bnb || 0) + vol_bnb,
      fee_bnb: (prev.fee_bnb || 0) + fee_bnb,
    }
  }

  return (
    <>
      <PagiCard
        title='Monthly Stats'
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
        tabs={tabs.map(t => ({
          ...t,
          active: t.key === chain,
          onClick: () => updatePathname(t.key, type, token)
        }))}
        queryUrl={queryUrl}
        fallback='/stats/daily'
        reducer={reducer}
        tableHeaders={[
          { name: 'Month', width: '5%' },
          { name: '# Swaps', width: '8%', size: 'xs',className: 'text-right' },
          { name: '# api', width: '4%', size: 'xs', className: 'text-right' },
          { name: '# auto', width: '4%', size: 'xs', className: 'text-right' },
          { name: '# m2', width: '4%', size: 'xs', className: 'text-right' },
          { name: 'USD Vol', width: '12%', size: 'xs',className: 'text-right' },
          { name: 'USD Fee', width: '6%', size: 'xs',className: 'text-right' },
          { name: 'BTC Vol', width: '10%', size: 'xs',className: 'text-right' },
          { name: 'BTC Fee', width: '6%', size: 'xs',className: 'text-right' },
          { name: 'ETH Vol', width: '10%', size: 'xs',className: 'text-right' },
          { name: 'ETH Fee', width: '6%', size: 'xs',className: 'text-right' },
          { name: 'BNB Vol', width: '10%', size: 'xs',className: 'text-right' },
          { name: 'BNB Fee', width: '6%', size: 'xs',className: 'text-right' },
          { name: 'Addrs', width: '9%', size: 'xs',className: 'pr-4 sm:pr-6 text-right' },
        ]}
        Row={StatTableRowByToken}
      />
    </>
  )
}
