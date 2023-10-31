import { count } from './lib'

export default async function handler(req, res) {
  const result = await count(req.query.addr, { inChain: '0x003c' })

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
