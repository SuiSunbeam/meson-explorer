import { count, getTimeQuery } from './lib'

export default async function handler(req, res) {
  const { addr, start, end } = req.query
  const result = await count(addr, { inChain: '0x003c', ...getTimeQuery(start, end) })

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
