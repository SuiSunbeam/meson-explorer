import { fee } from './lib'

export default async function handler(req, res) {
  const result = await fee(req.query.addr)

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
