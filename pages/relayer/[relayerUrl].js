import React from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { utils } from 'ethers'

import Card, { CardTitle, CardBody } from 'components/Card'
import LoadingScreen from 'components/LoadingScreen'
import Table, { Td } from 'components/Table'
import TagNetwork from 'components/TagNetwork'

import fetcher from 'lib/fetcher'
import { presets } from 'lib/swap'

export default function RelayerPage() {
  const router = useRouter()
  const { relayerUrl = '' } = router.query
  const decodedRelayerUrl = decodeURIComponent(relayerUrl)

  return (
    <Card>
      <CardTitle
        title='Relayer'
        subtitle={decodedRelayerUrl}
        tabs={[
          { key: 'status', name: 'Status', active: true },
        ]}
      />
      <CardBody>
      {
        decodedRelayerUrl && <RelayerStatus relayerUrl={decodedRelayerUrl} />
      }
      </CardBody>
    </Card>
  )
}

function RelayerStatus ({ relayerUrl }) {
  const { data, error } = useSWR(`${relayerUrl}/status`, fetcher, { refreshInterval: 5_000 })

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
          { name: 'Status (latency)', width: '15%' },
          { name: 'Update', width: '15%' },
          { name: 'Blocks', width: '15%' },
          { name: 'Gas Price', width: '15%' },
        ]}
      >
        {data.map((row, index) => <RelayerStatusRow key={`row-${index}`} {...row} />)}
      </Table>
    )
  }
}

const fmt = Intl.NumberFormat()

function RelayerStatusRow ({ networkId, url, ...details }) {
  const network = presets.getNetwork(networkId)
  return (
    <tr className='odd:bg-white even:bg-gray-50 hover:bg-primary-50'>
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
      <TdRelayerDetails {...details} />
    </tr>
  )
}

function TdRelayerDetails ({ ts, success, latency, block, gasPrice, error }) {
  const [now, setNow] = React.useState(Date.now())

  React.useEffect(() => {
    const h = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(h)
  }, [])

  if (!success) {
    return (
      <Td size='sm' colSpan={3} wrap>
        🔴 <span>{error}</span>
      </Td>
    )
  }
  
  return (
    <>
      <Td size='sm'>🟢 {latency} ms</Td>
      <Td size='sm'>{Math.floor(now / 1000 - ts)} sec ago</Td>
      <Td size='sm'>{fmt.format(block)}</Td>
      <Td size='sm'>{gasPrice && `${fmt.format(utils.formatUnits(gasPrice, 9))} Gwei`}</Td>
    </>
  )
}
