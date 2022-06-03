import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

import {
  Chart,
  PointElement,
  LineElement,
  LinearScale,
  ScatterController,
  Title,
  Legend,
  Tooltip
} from 'chart.js'

import fetcher from '../../../lib/fetcher'
import LoadingScreen from '../../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../../components/Card'
import TagNetwork from '../../../components/TagNetwork'

import { getAllNetworks } from '../../../lib/swap'

Chart.register(PointElement, LineElement, LinearScale, ScatterController, Title, Legend, Tooltip)

export default function AuthWrapper() {
  const { data: session } = useSession()

  if (!session?.user) {
    return 'Need login'
  }

  return <QueuedBlocks />
}

function QueuedBlocks() {
  const router = useRouter()
  const { chain } = router.query

  const tabs = getAllNetworks().map(n => ({
    key: n.id,
    name: n.name,
    display: <TagNetwork size='md' network={n} className='ml-1' />,
    shortCoinType: n.shortSlip44
  }))

  const { data, error } = useSWR(`queued/blocks/${chain}`, fetcher)
  const success = Boolean(!error && data)

  React.useEffect(() => {
    if (success) {
      const ctx = document.getElementById('chart-queued-blocks').getContext('2d');
      const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Done',
              backgroundColor: 'rgb(75, 192, 192)',
              data: data.done.map(el => ({ x: el.n, y: 1 }))
            },
            {
              label: 'Running',
              backgroundColor: 'rgb(54, 162, 235)',
              data: data.running.map(el => ({ x: el.n, y: 2 }))
            },
            {
              label: 'Failed',
              backgroundColor: 'rgb(255, 99, 132)',
              data: data.failed.map(el => ({ x: el.n, y: 3 }))
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Queued blocks on ${chain}`,
            }
          }
        }
      })
      return () => myChart.destroy()
    }
  }, [success, chain])

  let body
  if (error) {
    body = <div className='py-6 px-4 sm:px-6 text-red-400'>{error.message}</div>
  } else if (!data) {
    body = <LoadingScreen />
  } else {
    body = <div className='p-3'><canvas id='chart-queued-blocks' /></div>
  }

  return (
    <Card>
      <CardTitle
        title='Queued Blocks'
        tabs={tabs.map(t => ({
          ...t,
          active: t.key === chain,
          onClick: () => router.push(`/queued/blocks/${t.key}`)
        }))}
      />
      <CardBody>
        {body}
      </CardBody>
    </Card>
  )
}
