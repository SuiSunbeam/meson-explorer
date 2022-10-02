import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'

import fetcher from 'lib/fetcher'
import { presets, abbreviate, formatDate } from 'lib/swap'
import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Table, { Td } from 'components/Table'
import Pagination from 'components/Pagination'
import ExternalLink from 'components/ExternalLink'
import Badge from 'components/Badge'
import AmountDisplay from 'components/AmountDisplay'

export default function PaidPremiumList() {
  const router = useRouter()
  const page = Number(router.query.page || 1) - 1
  const pageValid = !Number.isNaN(page) && Number.isInteger(page) && page >= 0
  if (!pageValid) {
    router.replace('/')
  }
  
  React.useEffect(() => {
    if (!pageValid) {
      router.replace('/premium')
    }
  }, [pageValid, router])

  const { data, error } = useSWR(pageValid && `premium?page=${page}`, fetcher)

  let body
  if (!pageValid) {
    body = <LoadingScreen />
  } else if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    const { total, list } = data
    if (page * 10 > total) {
      router.replace('/premium')
    }
    const onPageChange = page => router.push(`/premium?page=${page+1}`)
    body = (
      <>
        <Table headers={[
          { name: 'initiator / time', width: '20%', className: 'pl-3 md:pl-4 hidden sm:table-cell' },
          { name: 'type', width: '10%' },
          { name: 'tx hash', width: '20%' },
          { name: 'paid', width: '10%' },
          { name: 'usage', width: '15%' },
          { name: 'valid', width: '25%' }
        ]}>
          {list.map(row => <PaidPremiumRow key={row._id} {...row} />)}
        </Table>
        <Pagination size={10} page={page} total={total} onPageChange={onPageChange} />
      </>
    )
  }

  return (
    <Card>
      <CardTitle
        title='Paid Premium'
        subtitle=''
      />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}

function PaidPremiumRow ({ initiator, hash, paid, used, quota, since, until, meta }) {
  let type = 'BUY'
  let badgeType = 'info'
  if (!since) {
    type = 'EXTRA'
    badgeType = 'warning'
  } else if (since > meta.ts) {
    type = 'RENEW'
    badgeType = 'success'
  }
  const network = presets.getNetwork(meta.network)
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-3 md:pl-4 py-2'>
        <div className='text-primary hover:underline'>
          <Link href={`/address/${initiator}`}>{abbreviate(initiator, 8, 6)}</Link>
        </div>
        <div className='text-xs text-gray-500'>
          {new Date(meta.ts * 1000).toLocaleString()}
        </div>
      </Td>
      <Td><Badge type={badgeType}>{type}</Badge></Td>
      <Td>
        <ExternalLink size='md' className='text-black' href={`${network?.explorer}/tx/${hash}`}>
          {abbreviate(hash, 8, 6)}
        </ExternalLink>
      </Td>
      <Td>
        <div>$<AmountDisplay value={paid} /></div>
        <div className='text-xs text-gray-500'>{network.name}</div>
      </Td>
      <Td>
      {
        type === 'EXTRA' 
          ? <div>+{paid / 200000 + 0.05}k</div>
          : <>
              <div>{Math.floor(used / 1000_000000)}k / {quota / 1000_000000}k</div>
              <div className='text-xs text-gray-500'>{Math.floor(used/quota*1000)/10}%</div>
            </>
        
      }
      </Td>
      <Td>{type !== 'EXTRA' && `${formatDate(since * 1000)} - ${formatDate(until * 1000)}`}</Td>
    </tr>
  )
}