import { ethers } from 'ethers'
import mesonPresets from '@mesonfi/presets'

const testnetMode = Boolean(process.env.NEXT_PUBLIC_TESTNET)
mesonPresets.useTestnet(testnetMode)

export const presets = mesonPresets

export function getSwapId (encoded, initiator) {
  const packed = ethers.utils.solidityPack(['bytes32', 'address'], [encoded, initiator])
  return ethers.utils.keccak256(packed)
}

export function getAllNetworks() {
  return mesonPresets.getAllNetworks()
}

export function getExtType(coinType) {
  const network = mesonPresets.getNetworkFromShortCoinType(coinType)
  if (!network) {
    return 'metamask'
  }
  return network.extensions[0]
}

export function abbreviate(str, pre = 8, post = 6) {
  if (!str) {
    return ''
  }
  const len = str.length
  return `${str.substr(0, pre)}...${str.substr(len - post)}`
}

const statusList = [
  'REQUESTING',
  'POSTED',
  'BONDED',
  'LOCKED',
  'UNLOCKED',
  'RELEASING',
  'EXECUTED',
  'RELEASED',
  'CANCELLED',
]

export function getMaxEvent(events) {
  return statusList[Math.max(...events
    .filter(e => !e.name.endsWith(':FAILED'))
    .map(e => statusList.indexOf(e.name))
  )]
}

export function sortEvents(events) {
  if (!events) {
    return []
  }
  return events
    .map(e => ({ ...e, index: statusList.indexOf(e.name.split(':')[0]) }))
    .sort((a, b) => a.index - b.index)
}

export function getStatusFromEvents(events, expired) {
  const maxEvent = getMaxEvent(events)
  if (maxEvent === 'RELEASED') {
    if (!events.find(e => e.name === 'EXECUTED')) {
      return 'RELEASED'
    } else {
      return 'DONE'
    }
  } else if (maxEvent === 'CANCELLED') {
    if (events.find(e => e.name === 'LOCKED') && !events.find(e => e.name === 'UNLOCKED')) {
      return 'CANCELLED*'
    } else {
      return 'CANCELLED'
    }
  } else if (maxEvent === 'EXECUTED') {
    return 'RELEASING*'
  } else if (expired) {
    if (maxEvent === 'REQUESTING') {
      return 'DROPPED'
    } else if (!['RELEASED', 'CANCELLED'].includes(maxEvent)) {
      if (events.find(e => e.name === 'UNLOCKED') || !events.find(e => e.name === 'LOCKED')) {
        return 'EXPIRED'
      } else {
        return 'EXPIRED*'
      }
    }
  }
  return maxEvent
}

export function getDuration(t1, t2) {
  if (!t2) {
    return '-'
  }
  const diff = new Date(t2) - new Date(t1)
  return formatDuration(diff)
}

export function formatDuration(diff) {
  if (diff < 1000) {
    return '-'
  }
  const duration = new Date(diff)
  const hh = duration.getUTCHours().toString().padStart(2, '0')
  const mm = duration.getUTCMinutes().toString().padStart(2, '0')
  const ss = duration.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function formatDate(t) {
  const date = new Date(t)
  const YYYY = date.getUTCFullYear().toString()
  const MM = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const DD = date.getUTCDate().toString().padStart(2, '0')
  return `${YYYY}/${MM}/${DD}`
}

export function getExplorerTxLink({ network }, hash) {
  return network.id.startsWith('tron')
    ? `${network.explorer}/transaction/${hash}`
    : `${network.explorer}/tx/${hash}`
}

export function getExplorerTokenLink(token) {
  return token.link || (token.addr ? `token/${token.addr}` : '')
}
