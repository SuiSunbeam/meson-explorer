import { fee, getTimeQuery } from './lib'

export default async function handler(req, res) {
  const { addr, start, end } = req.query
  const result = await fee(addr, getTimeQuery(start, end))

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
