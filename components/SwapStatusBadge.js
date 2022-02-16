import Badge from './Badge'

export default function SwapStatusBadge({ status, expired }) {
  if (expired) {
    if (status === 'REQUESTING') {
      status = 'DROPPED'
    } else if (!['DONE', 'CANCELLED'].includes(status)) {
      status = 'EXPIRED'
    }
  }
  return <Badge type={badgeType(status)}>{status}</Badge>
}

function badgeType(status) {
  if (status === 'DONE') {
    return 'success'
  } else if (status === 'EXPIRED') {
    return 'error'
  } else if (['LOCKED', 'RELEASING'].includes(status)) {
    return 'info'
  } else if (['REQUESTING', 'POSTED', 'BONDED'].includes(status)) {
    return 'warning'
  }
}