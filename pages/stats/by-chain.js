import React from 'react'
import classnames from 'classnames'

import PagiCard from 'components/Pagi/PagiCard'
import ButtonGroup from 'components/ButtonGroup'
import TagNetwork from 'components/TagNetwork'
import { Td } from 'components/Table'

import { getAllNetworks } from 'lib/swap'

const networks = getAllNetworks()

export default function StatsByChain() {
  const [view, setView] = React.useState('count-lines')

  const headers = React.useMemo(() => {
    return [
      { name: 'Date' },
      ...networks.map(n => ({ name: <TagNetwork size='md' network={n} iconOnly /> }))
    ]
  }, [])
  
  const StatByChainRowByView = React.useCallback(({ data }) => StatByChainRow({ data, view }), [view])

  return (
    <PagiCard
      title='Stats for Swaps by Chain'
      queryUrl='/stats/by-chain'
      fallback='/stats/by-chain'
      right={
        <ButtonGroup
          size='sm'
          active={view}
          buttons={[
            { key: 'count-lines', text: `Count by Lines` },
            { key: 'count', text: `Count by Numbers` },
          ]}
          onChange={view => setView(view)}
        />
      }
      tableHeaders={headers}
      Row={StatByChainRowByView}
    />
  )
}

function StatByChainRow ({ data, view = 'count' }) {
  const { _id: date, ...rest } = data
  const tds = networks.map(n => {
    const d = rest[n.shortSlip44]

    let content = null
    if (!d) {
      content = ''
    } else if (view === 'count') {
      content = (
        <div className='w-10'>
          <StatsByChainCountTextCell data={d.from} />
          <div className='w-full my-px h-px bg-gray-500' />
          <StatsByChainCountTextCell data={d.to} />
        </div>
      )
    } else if (view === 'count-lines') {
      content = (
        <div className='w-10'>
          <StatsByChainCountLinesCell data={d.from} />
          <div className='w-full my-0.5 h-px bg-gray-500' />
          <StatsByChainCountLinesCell data={d.to} />
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
      data.map((d, i) => (
        <div key={i} className={classnames('text-[9px] leading-[10px]', `text-${colors[d.tokenType]}`)}>
          {d.success} / {d.count}
        </div>
      ))
    }
    </div>
  )
}

function StatsByChainCountLinesCell ({ data = [] }) {
  return (
    <div className='w-10 flex flex-col gap-px'>
    {
      data.map((d, i) => (
        <div key={i} className='w-full overflow-hidden bg-gray-100 flex flex-col gap-px'>
          <CountLines value={d.count} bg={`bg-${colors[d.tokenType]}`} rate={1 - d.success/d.count} />
        </div>
      ))
    }
    </div>
  )
}

function CountLines ({ value, bg, rate }) {
  const lines = Array(Math.ceil(value / 100)).fill(0)
  return lines.map((_, i) => <CountLine key={`line-${i}`} value={value - 100 * i} bg={bg} rate={rate} />)
}

function CountLine ({ value, bg, rate }) {
  return (
    <div className={classnames('h-1.5 max-w-full', bg)} style={{ width: `${value / 2.5}px` }}>
      <div className='h-full bg-red-500 float-right' style={{ width: `${rate * 100}%` }} />
    </div>
  )
}
