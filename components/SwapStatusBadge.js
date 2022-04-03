import Badge from './Badge'
import { getStatusFromEvents } from '../lib/swap'

export default function SwapStatusBadge({ events, expired, error, className }) {
  const status = error ? 'ERROR' : getStatusFromEvents(events, expired)
  return <Badge type={badgeType(status)} className={className}>{status}</Badge>
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
    case 'RELEASING*':
      return 'info'
    case 'REQUESTING':
    case 'POSTED':
    case 'BONDED':
      return 'warning'
    default:
      return ''
  }
}
