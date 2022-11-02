import fetch from 'node-fetch'
import { presets } from 'lib/swap'

const relayer = process.env.NEXT_PUBLIC_SERVER_URL.split(',')[0]

const query = (addr, pageSize = 2000) => `?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=${pageSize}&sort=desc`

const API_HOSTS = {
  eth: 'https://api.etherscan.io/api',
  bnb: 'https://api.bscscan.com/api',
  polygon: 'https://api.polygonscan.com/api',
  arb: 'https://api.arbiscan.io/api',
  opt: 'https://api-optimistic.etherscan.io/api',
  avax: 'https://api.snowtrace.io/api',
  ftm: 'https://api.ftmscan.com/api',
  aurora: 'https://api.aurorascan.dev/api',
  cfx: 'https://evmapi.confluxscan.net/api',
  movr: 'https://api-moonriver.moonscan.io/api'
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await post(req, res)
  } else {
    res.status(404).send()
  }
}

async function post(req, res) {
  const { networkId, encoded } = req.body
  const encodedList = encoded.split(',').map(hex => hex.replace('0x', ''))

  const network = presets.getNetwork(networkId)
  if (!network) {
    res.status(404).send()
    return
  }
  const host = API_HOSTS[networkId]
  if (!host) {
    res.status(404).send()
    return
  }

  const url = host + query(network.mesonAddress)
  const response = await fetch(url)
  const json = await response.json()
  const txs = json.result
    .filter(tx => encodedList.includes(tx.input.substring(10, 74)))
    .filter(tx => tx.txreceipt_status !== '0')

  await Promise.all(txs.map(async tx => {
    const response = await fetch(`${relayer}/transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },  
      body: JSON.stringify({ networkId, hash: tx.hash })
    })
    await response.json()
  }))

  res.json({ result: txs })
}
