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
    .select('events created released')
    .sort({ created: -1 })
    .limit(20)
    .exec()
  
  const released = list.filter(swap => !!swap.events.find(e => e.name === 'RELEASED'))
  
  const durations = released.map(swap => swap.released - swap.created)
  const fails = (20 - released.length) / 20

  const duration = Math.floor(durations.reduce((x, y) => x + y, 0 ) / durations.length / 1000)
  return { fails, duration }
}

async function get(req, res) {
  const result = await getRecentFailRate()
  res.json({ result })
}

async function post(req, res) {
  const result = await getRecentFailRate()
  await SwapFails.create({ ...result, ts: new Date() })
  res.json({ result })
}
