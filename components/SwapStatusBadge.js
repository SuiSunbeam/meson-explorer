import Badge from './Badge'
import { getMaxEvent } from '../lib/swap'

export default function SwapStatusBadge({ error, events, expired }) {
  const maxEvent = getMaxEvent(events)
  let status
  if (error) {
    status === 'ERROR'
  } else if (maxEvent === 'RELEASED') {
    if (!events.find(e => e.name === 'EXECUTED')) {
      status = 'RELEASED'
    } else {
      status = 'DONE'
    }
  } else if (maxEvent === 'EXECUTED') {
    status = 'RELEASING.'
  } else if (expired) {
    if (maxEvent === 'REQUESTING') {
      status = 'DROPPED'
    } else if (!['RELEASED', 'CANCELLED'].includes(maxEvent)) {
      status = 'EXPIRED'
    } else {
      status = maxEvent
    }
  } else {
    status = maxEvent
  }
  return <Badge type={badgeType(status)}>{status}</Badge>
}

function badgeType(status) {
  switch (status) {
    case 'RELEASED':
    case 'DONE':
      return 'success'
    case 'ERROR':
    case 'EXPIRED':
      return 'error'
    case 'LOCKED':
    case 'RELEASING':
    case 'RELEASING.':
      return 'info'
    case 'REQUESTING':
    case 'POSTED':
    case 'BONDED':
      return 'warning'
    default:
      return ''
  }
}
