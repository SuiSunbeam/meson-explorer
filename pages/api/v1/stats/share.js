import { Shares } from 'lib/db'

export default async function handler(req, res) {
  const result = await Shares.find({ n: { $gt: 0 } }).sort({ n: -1 }).limit(30)

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get share stats' } })
  }
}
