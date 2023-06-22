import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await get(req, res)
  } else {
    res.status(404).send()
  }
}

async function get(req, res) {
  const { trackId = '' } = req.query
  if (!trackId || trackId === '0' || trackId.length > 1) {
    res.status(404).end()
    return
  }
  const regex = new RegExp(`^0x[0-9a-f]{3}${trackId}`, 'i')
  const from = await Swaps.count({ salt: { $regex: regex }, inChain: '0x0324' })
  const to = await Swaps.count({ salt: { $regex: regex }, outChain: '0x0324' })
  res.json({ result: { from, to } })
}
