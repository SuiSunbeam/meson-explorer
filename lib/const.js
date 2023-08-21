export const RELAYERS = process.env.NEXT_PUBLIC_RELAYERS.split(',')
export const EXTRA_LPS = process.env.NEXT_PUBLIC_EXTRA_LPS?.split(',') || []

export const LPS_BY_NETWORK = JSON.parse(process.env.NEXT_PUBLIC_LPS_BY_NETWORK || '{}')