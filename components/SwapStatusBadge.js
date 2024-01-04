import Badge from './Badge'
import { getStatusFromEvents } from 'lib/swap'

export default function SwapStatusBadge({ status, error, className }) {
  const _status = error ? 'ERROR' : status
  return <Badge type={badgeType(_status)} className={className}>{_status}</Badge>
}

function badgeType(status) {
  switch (status) {
    case 'RELEASED':
    case 'RELEASED*':
    case 'DONE':
    case 'DONE*':
      return 'success'
    case 'ERROR':
    case 'EXPIRED':
    case 'EXPIRED*':
      return 'error'
    case 'LOCKED':
    case 'UNLOCKED':
    case 'RELEASING':
    case 'RELEASING*':
    case 'RELEASING...':
      return 'info'
    case 'REQUESTING':
    case 'POSTED':
    case 'BONDED':
      return 'warning'
    default:
      return ''
  }
}
