import fetch from 'node-fetch'
import { presets } from '../../../../../lib/swap'

const EXPLORER_APIS = {
  eth: 'https://api.etherscan.io',
  bnb: 'https://api.bscscan.com',
  polygon: 'https://api.polygonscan.com',
  evmos: 'https://evm.evmos.org',
  arb: '',
  opt: '',
  aurora: 'https://explorer.mainnet.aurora.dev',
  cfx: 'https://evm.confluxscan.net',
  avax: 'https://api.snowtrace.io',
  ftm: 'https://api.ftmscan.com',
  one: 'https://a.api.s0.t.hmny.io',
  movr: '',
}
const MESON_METHODS = {
  '0x8302ce5a': 'postSwap',
  '0xbe18e8a4': 'lock',
  '0xce924743': 'release',
  '0x4d11b0f1': 'executeSwap',
  '0xf1d2ec1d': 'unlock'
}

export default async function handler(req, res) {
  const { networkId, encoded } = req.query
  const result = await getMesonTransactions(networkId, encoded)
  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get banner' } })
  }
}

async function getMesonTransactions(networkId, encoded) {
  const network = presets.getNetwork(networkId)
  if (!EXPLORER_APIS[networkId]) {
    throw new Error(`No explorer api for ${networkId}`)
  }
  const res = await fetch(`${EXPLORER_APIS[networkId]}/api?module=account&action=txlist&address=${network.mesonAddress}&startblock=1&endblock=99999999&sort=asc`)
  const result = await res.json()
  return result.result.map(tx => {
    if (tx.input.substring(10, 74) !== encoded.replace('0x', '')) {
      return
    }
    const sighash = tx.input.substring(0, 10)
    const method = MESON_METHODS[sighash] || sighash
    return {
      method,
      hash: tx.hash,
      number: tx.blockNumber,
      status: tx.txreceipt_status
    }
  }).filter(Boolean)
}