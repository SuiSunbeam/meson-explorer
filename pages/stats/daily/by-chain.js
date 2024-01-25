import React from 'react'
import classnames from 'classnames'
import { ethers } from 'ethers'

import PagiCard from 'components/Pagi/PagiCard'
import ButtonGroup from 'components/ButtonGroup'
import TagNetwork from 'components/TagNetwork'
import { Td } from 'components/Table'

import { getAllNetworks } from 'lib/swap'

import { valueInStr } from './components'

const networks = getAllNetworks()

export default function StatsByChain() {
  const [view, setView] = React.useState('swaps-graph')

  const headers = React.useMemo(() => {
    return [
      { name: 'Date' },
      ...networks.map(n => ({ name: <TagNetwork size='md' network={n} iconOnly /> }))
    ]
  }, [])
  
  const StatByChainRowByView = React.useCallback(({ data }) => StatByChainRow({ data, view }), [view])

  return (
    <PagiCard
      title='Daily Swaps by Chain'
      queryUrl='/stats/by-chain'
      fallback='/stats/by-chain'
      right={
        <ButtonGroup
          size='sm'
          active={view}
          buttons={[
            { key: 'swaps-graph', text: `#Swaps (graph)` },
            { key: 'swaps', text: `#Swaps` },
            { key: 'fees-graph', text: `Fees (graph)` },
            { key: 'fees', text: `Fees ` },
          ]}
          onChange={view => setView(view)}
        />
      }
      tableHeaders={headers}
      Row={StatByChainRowByView}
    />
  )
}

function StatByChainRow ({ data, view = 'swaps' }) {
  const { _id: date, ...rest } = data
  const tds = networks.map(n => {
    const d = rest[n.shortSlip44]

    let content = null
    if (!d) {
      content = ''
    } else if (view === 'swaps') {
      content = (
        <div className='w-10'>
          <StatsByChainCountTextCell data={d.from} />
          <div className='w-full my-px h-px bg-gray-500' />
          <StatsByChainCountTextCell data={d.to} />
        </div>
      )
    } else if (view === 'swaps-graph') {
      content = (
        <div className='w-10'>
          <StatsByChainCountLinesCell data={d.from} />
          <div className='w-full my-0.5 h-px bg-gray-500' />
          <StatsByChainCountLinesCell data={d.to} />
        </div>
      )
    } else if (view === 'fees') {
      content = (
        <div className='w-10'>
          <StatsByChainFeesTextCell data={d.from} />
          <div className='w-full my-px h-px bg-gray-500' />
          <StatsByChainFeesTextCell data={d.to} />
        </div>
      )
    } else if (view === 'fees-graph') {
      content = (
        <div className='w-10'>
          <StatsByChainFeesLinesCell data={d.from} />
          <div className='w-full my-0.5 h-px bg-gray-500' />
          <StatsByChainFeesLinesCell data={d.to} />
        </div>
      )
    }
    return <Td key={n.id} size='narrow'>{content}</Td>
  })
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm'>{date}</Td>
      {tds}
    </tr>
  )
}

const colors = {
  stablecoins: 'primary',
  eth: 'indigo-500',
  bnb: 'warning'
}

function StatsByChainCountTextCell ({ data = [] }) {
  return (
    <div className='w-10 flex flex-col gap-px'>
    {
      data.map((d, i) => {
        const fail = d.count - d.success
        return (
          <div key={i} className={classnames('flex justify-between text-[10px] leading-[10px]', `text-${colors[d.tokenType]}`)}>
            <div>{d.success}</div>
            {fail ? <div className='text-red-500'>{fail}</div> : ''}
          </div>
        )
      })
    }
    </div>
  )
}

function StatsByChainFeesTextCell ({ data = [] }) {
  return (
    <div className='w-10 flex flex-col gap-px'>
    {
      data.map((d, i) => (
        <div key={i} className={classnames('text-[10px] leading-[10px]', `text-${colors[d.tokenType]}`)}>
          {valueInStr(d.lpFee + d.srFee, d.tokenType)}
        </div>
      ))
    }
    </div>
  )
}

function StatsByChainCountLinesCell ({ data = [] }) {
  return (
    <div className='w-10 flex flex-col gap-px'>
      {data.map((d, i) => <Lines key={i} value={d.count} bg={`bg-${colors[d.tokenType]}`} rate={1 - d.success/d.count} />)}
    </div>
  )
}

function StatsByChainFeesLinesCell ({ data = [] }) {
  return (
    <div className='w-10 flex flex-col gap-px'>
    {
      data.map((d, i) => {
        let value = (d.lpFee + d.srFee) / 1e6
        if (['eth', 'bnb'].includes(d.tokenType)) {
          value = value * 1000
        } else {
          value = value
        }
        return <Lines key={i} value={value} bg={`bg-${colors[d.tokenType]}`} />
      })
    }
    </div>
  )
}

function Lines ({ value, bg, rate = 0 }) {
  const lines = Array(Math.ceil(value / 100)).fill(0)
  return lines.map((_, i) => <Line key={`line-${i}`} value={value - 100 * i} bg={bg} rate={rate} />)
}

function Line ({ value, bg, rate }) {
  return (
    <div className='w-10 overflow-hidden bg-gray-100'>
      <div className={classnames('h-1.5 max-w-full', bg)} style={{ width: `${value / 2.5}px` }}>
        <div className='h-full bg-red-500 float-right' style={{ width: `${rate * 100}%` }} />
      </div>
    </div>
  )
}
