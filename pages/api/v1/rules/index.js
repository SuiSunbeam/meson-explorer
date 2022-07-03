import { Rules } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await Rules.find().sort({ priority: -1 }).exec()
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get rules' } })
    }
  } else if (req.method === 'POST') {
    const result = await Rules.insert(req.body)
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to create rule' } })
    }
  } else {
    res.status(404).send()
  }
}
