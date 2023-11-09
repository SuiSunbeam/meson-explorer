export const TESTNET = Boolean(process.env.NEXT_PUBLIC_TESTNET)

export const RELAYERS = process.env.NEXT_PUBLIC_RELAYERS.split(',')
export const EXTRA_LPS = process.env.NEXT_PUBLIC_EXTRA_LPS?.split(',') || []

export const LPS_BY_NETWORK = JSON.parse(process.env.NEXT_PUBLIC_LPS_BY_NETWORK || '{}')

export const SWAP_RES_FIELDS = 'encoded events initiator fromTo fromContract created released srFee lpFee'
export const AUTO_ADDRESSES = ['0x666d6b8a44d226150ca9058beebafe0e3ac065a2', '0x4fc928e89435f13b3dbf49598f9ffe20c4439cad']