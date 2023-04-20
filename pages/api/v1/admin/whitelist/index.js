import { LpWhitelist } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await LpWhitelist.find().exec()
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get lp whitelist' } })
    }
  } else if (req.method === 'POST') {
    try {
      const result = await LpWhitelist.create(req.body)
      res.json({ result })
    } catch (e) {
      console.warn(e)
      res.status(400).json({ error: { code: -32602, message: 'Failed to add new entry to lp whitelist' } })
    }
  } else {
    res.status(404).send()
  }
}
