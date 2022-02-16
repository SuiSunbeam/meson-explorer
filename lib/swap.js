import mesonPresets from '@mesonfi/presets'

mesonPresets.useTestnet(true)

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

export function getSwapDuration(swap) {
  if (!swap.done) {
    return '-'
  }
  const duration = new Date(new Date(swap.done) - new Date(swap.created))
  const hh = duration.getUTCHours().toString().padStart(2, '0')
  const mm = duration.getUTCMinutes().toString().padStart(2, '0')
  const ss = duration.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}