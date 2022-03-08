import mesonPresets from '@mesonfi/presets'

const testnetMode = Boolean(process.env.NEXT_PUBLIC_TESTNET)
mesonPresets.useTestnet(testnetMode)

export function getAllNetworks() {
  return mesonPresets.getAllNetworks()
}

export function parseNetworkAndToken(shortCoinType, tokenIndex) {
  const network = mesonPresets.getNetworkFromShortCoinType(shortCoinType)
  if (!network) {
    console.warn(`Fail to parse network: ${shortCoinType}`)
    return
  }
  const token = mesonPresets.getToken(network.id, tokenIndex)
  if (!token) {
    console.warn(`Fail to parse token of index ${tokenIndex} on ${network.id}`)
    return
  }

  return {
    networkId: network.id,
    networkName: network.name,
    networkAlias: network.alias,
    explorer: network.explorer,
    token,
  }
}

export function abbreviate(str, pre = 8, post = 6) {
  const len = str.length
  return `${str.substr(0, pre)}...${str.substr(len - post)}`
}

const statusList = [
  'REQUESTING',
  'POSTED',
  'BONDED',
  'LOCKED',
  'RELEASING',
  'RELEASED',
  'CANCELLED',
]
export function getSwapStatus(events) {
  return statusList[Math.max(...events.map(e => statusList.indexOf(e.name)))]
}

export function sortEvents(events) {
  return events.map(e => ({ ...e, index: statusList.indexOf(e.name) })).sort((a, b) => a.index - b.index)
}

export function getSwapDuration(swap) {
  if (!swap.released) {
    return '-'
  }
  const diff = new Date(swap.released) - new Date(swap.created)
  return getDuration(diff)
}

export function getDuration(diff) {
  if (diff < 1000) {
    return '-'
  }
  const duration = new Date(diff)
  const hh = duration.getUTCHours().toString().padStart(2, '0')
  const mm = duration.getUTCMinutes().toString().padStart(2, '0')
  const ss = duration.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}