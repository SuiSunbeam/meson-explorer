import React from 'react'
import classnames from 'classnames'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'

import { XCircleIcon } from '@heroicons/react/solid'
import { DocumentTextIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import fetcher from 'lib/fetcher'
import socket from 'lib/socket'
import {
  presets,
  sortEvents,
  FailedStatus,
  CancelledStatus,
  getStatusFromEvents,
  getDuration,
  getExplorerAddressLink,
  getExplorerTxLink
} from 'lib/swap'
import extensions from 'lib/extensions'

import LoadingScreen from 'components/LoadingScreen'
import Card, { CardTitle, CardBody } from 'components/Card'
import Button from 'components/Button'
import Badge from 'components/Badge'
import SwapStatusBadge from 'components/SwapStatusBadge'
import ListRow from 'components/ListRow'
import ExternalLink from 'components/ExternalLink'
import TagNetwork from 'components/TagNetwork'
import TagNetworkToken from 'components/TagNetworkToken'


const StatusDesc = {
  RELEASING: `Releasing fund to recipient...`,
  DROPPED: `Swap not processed by Meson. Fund still in user's address.`,
  EXPIRED: `Swap didn't finish within valid time. Need to withdraw fund.`,
  CANCELLED: `Swap didn't finish within valid time. Fund was returned to sender's address.`,
  UNLOCKED: `Swap didn't finish within valid time. Fund can be withdrawn after expire time.`
}

export default function SwapDetail() {
  const router = useRouter()
  const idOrEncoded = router.query.idOrEncoded
  const { data, error } = useSWR(`swap/${idOrEncoded}`, fetcher)

  if (error) {
    return (
      <Card>
        <CardTitle
          title='Swap'
          badge={<SwapStatusBadge error />}
          subtitle={error.message}
        />
        <CardBody border={false}>
          <dl>
            <ListRow title='Swap ID'>
              <div className='break-all'>{idOrEncoded}</div>
            </ListRow>
          </dl>
        </CardBody>
      </Card>
    )
  }

  return <CorrectSwap data={data} />
}

function CorrectSwap({ data: raw }) {
  const { data: session } = useSession()
  const isRoot = session?.user?.roles?.some(r => r === 'root')
  const authorized = session?.user?.roles?.some(r => ['root', 'admin'].includes(r))

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
        } else if (data.recipient) {
          updates.fromTo = [prev.fromTo[0], data.recipient]
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
    return socket.subscribe(data._id, swapUpdateListener)
  }, [data?._id, noSubscribe])


  let body
  const { swap, from, to } = React.useMemo(() => presets.parseInOutNetworkTokens(data?.encoded), [data?.encoded])

  const status = getStatusFromEvents(data?.events, swap?.expireTs)

  if (!data) {
    body = <LoadingScreen />
  } else if (!from || !to) {
    body = ''
  } else {
    const fromAddress = data.fromTo[0] || data.initiator
    const recipient = data.fromTo[1] || ''
    const { srFee = 0, lpFee = 0 } = data

    let inAmount = ethers.utils.formatUnits(swap.amount, swap.inToken === 255 ? 4 : 6)
    let outAmount = ethers.utils.formatUnits(swap.amount.sub(srFee + lpFee), 6)
    if (swap.deprecatedEncoding) {
      inAmount = ethers.utils.formatUnits(swap.amount.add(swap.fee), swap.inToken === 255 ? 4 : 6)
      outAmount = ethers.utils.formatUnits(swap.amount, 6)
    }
    const feeSide = swap.deprecatedEncoding ? from : to
    body = (
      <dl>
        <ListRow title='Swap ID'>
          <div className='break-all'>{data._id}</div>
        </ListRow>
        <ListRow title='Encoded As'>
          <div className='break-all'>{data.encoded}</div>
          {!swap.version && <div className='text-sm text-gray-500'>v0 encoding</div>}
          {authorized && <SwapSaltBadges swap={swap} />}
        </ListRow>
        <ListRow title='From'>
          <TagNetwork network={from.network} address={fromAddress} />
          <div className='flex items-center text-normal'>
            {
              data.fromContract && 
              <DocumentTextIcon className='w-4 shrink-0 text-gray-500 mr-0.5' aria-hidden='true' />
            }
            <span className='truncate hover:underline hover:text-primary'>
              <Link href={`/address/${fromAddress}`}>{fromAddress}</Link>
            </span>
          </div>
        </ListRow>
        <ListRow title='To'>
          <TagNetwork network={to.network} address={recipient} />
          <div className='flex items-center text-normal'>
            {
              ['6', '2'].includes(swap.salt[2]) && 
              <DocumentTextIcon className='w-4 shrink-0 text-gray-500 mr-0.5' aria-hidden='true' />
            }
            <span className='truncate hover:underline hover:text-primary'>
              <Link href={`/address/${recipient}`}>{recipient}</Link>
            </span>
          </div>
        </ListRow>
        <ListRow title='Amount'>
          <div className='flex items-center'>
            <div className={classnames(
              'relative flex items-center',
              CancelledStatus.includes(status) && 'opacity-30 before:block before:absolute before:w-full before:h-0.5 before:bg-black before:z-10'
            )}>
              <div className='mr-1'>{inAmount}</div>
              <TagNetworkToken explorer={from.network.explorer} token={from.token} className={CancelledStatus.includes(status) && 'text-black'}/>
            </div>
            {
              !FailedStatus.includes(status) &&
              <>
                <div className='text-sm text-gray-500 mx-1'>{'->'}</div>
                <div className='mr-1'>{outAmount}</div>
                <TagNetworkToken explorer={to.network.explorer} token={to.token} />
              </>
            }
          </div>
        </ListRow>
        {
          !FailedStatus.includes(status) &&
          <ListRow title='Fee'>
            <div className='flex items-center'>
              <div className='mr-1'>{ethers.utils.formatUnits(srFee + lpFee, 6)}</div>
              <TagNetworkToken explorer={feeSide.network.explorer} token={feeSide.token} />
            </div>
            <div className={classnames('text-sm text-gray-500', srFee + lpFee > 0 ? '' : 'hidden')}>
              {ethers.utils.formatUnits(srFee, 6)} Service fee + {ethers.utils.formatUnits(lpFee, 6)} LP fee
            </div>
          </ListRow>
        }
        <ListRow title='Requested at'>
          {new Date(data.created).toLocaleString()}
        </ListRow>
        <SwapTimes data={data} swap={swap} />

        <ListRow title='Process'>
          <ul role='list' className='border border-gray-200 rounded-md divide-y divide-gray-200 bg-white'>
            {sortEvents(data.events).map((e, index) => (
              <li key={`process-${index}`}>
                <div className='lg:grid lg:grid-cols-4 sm:px-4 sm:py-3 px-3 py-2 text-sm'>
                  <div><SwapStepName {...e} /></div>
                  <div className='lg:col-span-3 lg:flex lg:flex-row lg:justify-end'>
                    <div className='max-w-full truncate text-gray-500'>
                      <SwapStepInfo {...e} fromAddress={fromAddress} from={from} to={to} />
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

  return (
    <Card>
      <CardTitle
        title='Swap'
        badge={(
          <div className='flex flex-row items-center'>
            <SwapStatusBadge events={data?.events} expireTs={swap?.expireTs} />
            {authorized && data?.hide && <Badge className='ml-2'>HIDE</Badge>}
            {isRoot && data?.modified && <Badge type='warning' className='ml-2'>MODIFIED</Badge>}
            {isRoot && data?.errorConfirmed && <Badge type='warning' className='ml-2'>ERROR CONFIRMED</Badge>}
          </div>
        )}
        subtitle={StatusDesc[status?.replace('*', '')]}
        right={authorized && <SwapActionButton data={data} swap={swap} status={status} from={from} to={to} />}
      />
      <CardBody border={!data}>
        {body}
      </CardBody>
    </Card>
  )
}

function SwapActionButton({ data, swap, status, from, to }) {
  if (!data) {
    return null
  }

  const locks = data.events.filter(e => e.name === 'LOCKED').length
  const unlocks = data.events.filter(e => e.name === 'UNLOCKED').length
  const releases = data.events.filter(e => e.name === 'RELEASED').length
  const executed = data.events.filter(e => e.name === 'EXECUTED').length

  if (executed && locks && (releases + unlocks - locks === 0)) {
    return null
  }

  const initiator = data.initiator || data.fromTo[0]
  const recipient = data.fromTo[1]

  let actionButton = null
  switch (status) {
    case 'REQUESTING':
    case 'POSTED':
      actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.bond(swap, data.signature, initiator)}>Bond</Button>
      break;
    case 'BONDED':
      actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.lock(swap, data.signature, initiator)}>Lock</Button>
      break;
    case 'EXPIRED*':
    case 'CANCELLED*':
      actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.unlock(swap, initiator)}>Unlock</Button>
      break;
    case 'EXPIRED':
      actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.withdraw(swap)}>Withdraw</Button>
      break;
    case 'RELEASING':
    case 'RELEASED':
      actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.execute(swap, data.releaseSignature, recipient)}>Execute</Button>
      break;
    default:
      if (locks > releases + unlocks) {
        if (swap.expired) {
          actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.unlock(swap, initiator)}>Unlock</Button>
        } else {
          actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.release(swap, data.releaseSignature, initiator, recipient)}>Release</Button>
        }
      } else if (!swap.expired) {
        actionButton = <Button size='sm' color='info' rounded onClick={() => extensions.lock(swap, data.signature, initiator)}>Lock</Button>
      }
  }

  return (
    <div className='flex flex-row gap-1'>
      {actionButton}
    </div>
  )
}

function SwapSaltBadges({ swap }) {
  const badges = []
  if (swap.willWaiveFee) {
    badges.push('No Service Fee')
  }
  if (['8'].includes(swap.salt[3])) {
    badges.push('Non-typed Signing')
  }
  if (['d', '9'].includes(swap.salt[2])) {
    badges.push('API')
  } else if (['6', '2'].includes(swap.salt[2])) {
    badges.push('meson.to')
  } else if (['e', 'a'].includes(swap.salt[2])) {
    badges.push('meson.to')
    badges.push('alls.to')
  }
  if (['f'].includes(swap.salt[4])) {
    badges.push('Cashback')
  }
  return (
    <div className='flex gap-1'>
      {badges.map((text, i) => <Badge key={`badge-${i}`} type='info'>{text}</Badge>)}
    </div>
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

function SwapStepInfo({ index, hash, recipient, name, fromAddress, from, to }) {
  if (index === 0) {
    return <ExternalLink href={getExplorerAddressLink(from.network, fromAddress)}>{fromAddress}</ExternalLink>
  } else if (index === 6) {
    return <ExternalLink href={getExplorerAddressLink(to.network, recipient)}>{recipient}</ExternalLink>
  }
  return (
    <div className='flex items-center'>
      {name.endsWith(':FAILED') && <FailedIcon />}
      <div className='truncate'>
        <ExternalLink href={getExplorerTxLink(([4, 5, 9].includes(index) ? to : from).network, hash)}>
          {hash}
        </ExternalLink>
      </div>
    </div>
  )
}

function FailedIcon() {
  return <div className='text-red-400 w-4 mr-1'><XCircleIcon className='w-4' aria-hidden='true' /></div>
}

function SwapTimes({ data, swap }) {
  if (data.released) {
    return (
      <>
        <ListRow title='Finished at'>{new Date(data.released).toLocaleString()}</ListRow>
        <ListRow title='Duration'>{getDuration(data.created, data.released)}</ListRow>
      </>
    )
  }
  return (
    <ListRow title={swap.expired ? 'Expired at' : 'Will expire at'}>
      {new Date(swap.expireTs * 1000).toLocaleString()}
    </ListRow>
  )
}
