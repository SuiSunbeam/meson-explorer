import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { XCircleIcon } from '@heroicons/react/solid'
import useSWR from 'swr'
import { ethers } from 'ethers'
import { Swap } from '@mesonfi/sdk'

import socket from '../../lib/socket'
import { parseNetworkAndToken, sortEvents, getDuration } from '../../lib/swap'

import LoadingScreen from '../../components/LoadingScreen'
import Card, { CardTitle, CardBody } from '../../components/Card'
import SwapStatusBadge from '../../components/SwapStatusBadge'
import ListRow from '../../components/ListRow'
import ExternalLink from '../../components/ExternalLink'
import TagNetwork from '../../components/TagNetwork'
import TagNetworkToken from '../../components/TagNetworkToken'

const fetcher = async swapId => {
  if (!swapId) {
    throw new Error('No swap id')
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/swap/${swapId}`)
  if (res.status >= 400) {
    throw new Error('Swap not found')
  }
  const json = await res.json()
  if (json.result) {
    return json.result
  } else {
    throw new Error(json.error.message)
  }
}

export default function SwapDetail() {
  const router = useRouter()
  const swapId = router.query.swapId
  const { data, error } = useSWR(swapId, fetcher)

  if (error) {
    return (
      <Card>
        <CardTitle
          title='Swap'
          badge={<SwapStatusBadge error />}
          subtitle={swapId}
        />
        <CardBody>
          <dl>
            <ListRow title='Reason'>
              {error.message}
            </ListRow>
          </dl>
        </CardBody>
      </Card>
    )
  }
  
  return <CorrectSwap swapId={swapId} data={data} />
}

function CorrectSwap({ swapId, data: raw }) {
  const [data, setData] = React.useState(raw)
  React.useEffect(() => { setData(raw) }, [raw])

  const swapUpdateListener = ({ status, data } = {}) => {
    setData(prev => {
      const updates = {}
      if (!data.hash || !prev.events.find(e => e.hash === data.hash)) {
        updates.events = [...prev.events, { name: status, ...data }]
      }
      if (!data.failed) {
        if (status === 'RELEASED') {
          updates.released = data.ts * 1000
        } else if (status === 'EXECUTED') {
          updates.executed = data.ts * 1000
        }
        if (data.provider) {
          updates.provider = data.provider
        } else if (data.provider) {
          updates.recipient = data.recipient
        }
      }
      if (Object.keys(updates).length) {
        return { ...prev, ...updates }
      }
      return prev
    })
  }

  const noSubscribe = !data || (data.released && data.executed)
  React.useEffect(() => {
    if (noSubscribe) {
      return
    }
    return socket.subscribe(swapId, swapUpdateListener)
  }, [swapId, noSubscribe])

  let body
  let swap
  if (!data) {
    body = <LoadingScreen />
  } else {
    try {
      swap = Swap.decode(data.encoded)
    } catch {}

    const from = parseNetworkAndToken(swap?.inChain, swap?.inToken)
    const to = parseNetworkAndToken(swap?.outChain, swap?.outToken)

    if (!from || !to) {
      body = ''
    } else {
      body = (
        <dl>
          <ListRow title='Encoded As'>
            <div className='truncate'>{data.encoded}</div>
          </ListRow>
          <ListRow title='From'>
            <TagNetwork network={from} address={data.initiator} />
            <div className='text-normal hover:underline hover:text-primary'>
              <Link href={`/address/${data.initiator}`}>{data.initiator}</Link>
            </div>
          </ListRow>
          <ListRow title='To'>
            <TagNetwork network={to} address={data.recipient || ''} />
            <div className='text-normal hover:underline hover:text-primary'>
              <Link href={`/address/${data.initiator}`}>{data.recipient || ''}</Link>
            </div>
          </ListRow>
          <ListRow title='Amount'>
            <div className='flex items-center'>
              <div className='mr-1'>{ethers.utils.formatUnits(swap.amount, 6)}</div>
              <TagNetworkToken explorer={from.explorer} token={from.token} />
              <div className='text-sm text-gray-500 mx-1'>{'->'}</div>
              <TagNetworkToken explorer={to.explorer} token={to.token} />
            </div>
          </ListRow>
          <ListRow title='Fee'>
            <div className='flex items-center'>
              <div className='mr-1'>{ethers.utils.formatUnits(swap.fee, 6)}</div>
              <TagNetworkToken explorer={from.explorer} token={from.token} />
            </div>
          </ListRow>
          <ListRow title='Requested at'>
            {new Date(data.created).toLocaleString()}
          </ListRow>
          {data.provider && <ListRow title='Provider'>{data.provider}</ListRow>}
          <SwapTimes data={data} expired={expired} expireTs={swap.expireTs} />

          <ListRow title='Process'>
            <ul role='list' className='border border-gray-200 rounded-md divide-y divide-gray-200 bg-white'>
              {sortEvents(data?.events).map((e, index) => (
                <li key={`process-${index}`}>
                  <div className='lg:grid lg:grid-cols-4 sm:px-4 sm:py-3 px-3 py-2 text-sm'>
                    <div><SwapStepName {...e} /></div>
                    <div className='lg:col-span-3 lg:flex lg:flex-row lg:justify-end'>
                      <div className='max-w-full truncate text-gray-500'>
                        <SwapStepInfo {...e} initiator={data.initiator} from={from} to={to} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ListRow>
        </dl>
      )
    }
  }

  const expired = swap?.expireTs < Date.now() / 1000
  return (
    <Card>
      <CardTitle
        title='Swap'
        badge={<SwapStatusBadge events={data?.events || []} expired={expired} />}
        subtitle={swapId}
      />
      <CardBody border={!data}>
        {body}
      </CardBody>
    </Card>
  )
}

function SwapStepName({ index, name }) {
  if (index === 0) {
    return 'Request by'
  } else if (index === 5) {
    return 'Release to'
  } else {
    return <span className='capitalize'>{name.split(':')[0].toLowerCase()}</span>
  }
}

function SwapStepInfo({ index, hash, recipient, name, initiator, from, to }) {
  if (index === 0) {
    return <ExternalLink size='sm' href={`${from.explorer}/address/${initiator}`}>{initiator}</ExternalLink>
  } else if (index === 5) {
    return <ExternalLink size='sm' href={`${to.explorer}/address/${recipient}`}>{recipient}</ExternalLink>
  }
  return (
    <div className='flex items-center'>
      {name.endsWith(':FAILED') && <FailedIcon />}
      <div className='truncate'>
        <ExternalLink size='sm' href={`${[3, 4, 7].includes(index) ? to.explorer : from.explorer}/tx/${hash}`}>{hash}</ExternalLink>
      </div>
    </div>
  )
}

function FailedIcon() {
  return <div className='text-red-400 w-4 mr-1'><XCircleIcon className='w-4' aria-hidden='true' /></div>
}

function SwapTimes({ data, expired, expireTs }) {
  if (data.released) {
    return (
      <>
        <ListRow title='Finished at'>{new Date(data.released).toLocaleString()}</ListRow>
        <ListRow title='Duration'>{getDuration(data.created, data.released)}</ListRow>
      </>
    )
  }
  return (
    <ListRow title={expired ? 'Expired at' : 'Will expire at'}>
      {new Date(expireTs * 1000).toLocaleString()}
    </ListRow>
  )
}
