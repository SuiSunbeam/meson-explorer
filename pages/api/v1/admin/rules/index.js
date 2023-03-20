import { Rules } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const type = req.query.type
    const query = {}
    if (type) {
      query.type = type
    }
    const result = await Rules.find(query).sort({ priority: -1 }).exec()
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get rules' } })
    }
  } else if (req.method === 'POST') {
    try {
      const result = await Rules.create(req.body)
      res.json({ result })
    } catch (e) {
      console.warn(e)
      res.status(400).json({ error: { code: -32602, message: 'Failed to create rule' } })
    }
  } else {
    res.status(404).send()
  }
}
