import { Swaps, SwapFails } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    get(req, res)
  } else if (req.method === 'POST') {
    post(req, res)
  } else {
    res.status(404).send()
  }
}

async function getRecentFailRate() {
  const query = { disabled: { $ne: true } }
  const list = await Swaps.find(query)
    .select('events')
    .sort({ created: -1 })
    .limit(50)
    .exec()
  return list.filter(swap => !swap.events.find(e => e.name === 'RELEASED')).length / 50
}

async function get(req, res) {
  const fails = await getRecentFailRate()
  res.json({ result: fails })
}

async function post(req, res) {
  const fails = await getRecentFailRate()
  const result = await SwapFails.create({ fails, ts: new Date() })
  res.json({ result })
}
