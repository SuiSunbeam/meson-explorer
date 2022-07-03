import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import { ethers } from 'ethers'

import Card, { CardTitle, CardBody } from '../../../components/Card'
import LoadingScreen from '../../../components/LoadingScreen'
import Table, { Td } from '../../../components/Table'

import fetcher from '../../../lib/fetcher'

export default function SwapRuleList() {
  const router = useRouter()
  const { address } = router.query

  const { data, error } = useSWR(`rules`, fetcher)

  let body = null
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = (
      <Table size='lg' headers={[
        { name: 'route / priority', width: '25%', className: 'pl-4 md:pl-6' },
        { name: 'limit', width: '15%' },
        { name: 'fee rule', width: '60%' }
      ]}>
        {data.map((d, i) => <SwapRule key={i} d={d} />)}
      </Table>
    )
  }

  return (
    <Card>
      <CardTitle
        title='LP'
        subtitle={address}
        tabs={[
          { key: 'liquidity', name: 'Liquidity', onClick: () => router.push(`/lp/${address}`) },
          { key: 'rules', name: 'Swap Rules', active: true }
        ]}
      />
      <CardBody>{body}</CardBody>
    </Card>
  )
}

function SwapRule ({ d }) {
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-100'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1'>
        <div className='flex flex-row items-center'>
          {d.from}
          <div className='text-gray-500 mx-1 text-xs'>{'->'}</div>
          {d.to}
        </div>
        <div className='text-xs text-gray-500'>
          #{d.priority}
        </div>
      </Td>
      <Td size='sm'>{d.limit}</Td>
      <Td size='sm'>{d.fee?.map((item, i) => <FeeRule key={i} {...item} />)}</Td>
    </tr>
  )
}

function FeeRule ({ min, base, rate }) {
  const range = <span className='inline-block w-8'>{min && `[>${min}]`}</span>

  const rule = []
  if (base) {
    rule.push(`$${ethers.utils.formatUnits(base, 6)}`)
  }
  if (rate) {
    rule.push(`${rate/10000}%`)
  }
  if (!rule.length) {
    rule.push('0')
  }
  return (
    <div>{range}{rule.join(' + ')}</div>
  )
}
