import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Table, { Td } from 'components/Table'
import TagNetwork from 'components/TagNetwork'

import fetcher from 'lib/fetcher'
import { presets } from 'lib/swap'

export default function RelayerPage() {
  const router = useRouter()
  const { url } = router.query
  const decodedUrl = decodeURIComponent(url)

  return (
    <Card>
      <CardTitle
        title='Relayer'
        subtitle={decodedUrl}
        tabs={[
          { key: 'status', name: 'Status', active: true },
        ]}
      />
      <CardBody>
        <RelayerStatus url={decodedUrl} />
      </CardBody>
    </Card>
  )
}

function RelayerStatus ({ url }) {
  const { data, error } = useSWR(`${url}/status`, fetcher)

  if (error) {
    return (
      <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
    )
  } else if (!data) {
    return <LoadingScreen />
  } else {
    return (
      <Table
        fixed
        size='lg'
        headers={[
          { name: 'Network', width: '10%' },
          { name: 'Node Url', width: '30%' },
          { name: 'Details', width: '60%' },
        ]}
      >
        {data.map((row, index) => <RelayerStatusRow key={`row-${index}`} {...row} />)}
      </Table>
    )
  }
}

function RelayerStatusRow ({ networkId, success, url, latency, block, error }) {
  const network = presets.getNetwork(networkId)
  return (
    <tr className='odd:bg-white even:bg-gray-50'>
      <Td size='' className='pl-4 pr-3 sm:pl-6 py-1 text-sm'>
        <div className='flex'>
          <TagNetwork size='sm' network={network} iconOnly className='mr-1' />
          {network.name}
        </div>
      </Td>
      <Td size='sm' wrap>
        <div className='w-full overflow-x-auto'>
          <div className=''>{url}</div>
        </div>
      </Td>
      <Td size='sm' wrap>
      {success ? '🟢 ' : '🔴 '}
      {
        success
          ? `${block} / ${latency}ms`
          : <span>{error}</span>
      }
      </Td>
    </tr>
  )
}