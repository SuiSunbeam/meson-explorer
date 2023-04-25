import { Banners } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const query = {}
    const result = await Banners.find(query).sort({ priority: -1 }).exec()
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get banners' } })
    }
  } else if (req.method === 'POST') {
    try {
      const result = await Banners.create(req.body)
      res.json({ result })
    } catch (e) {
      console.warn(e)
      res.status(400).json({ error: { code: -32602, message: 'Failed to create banners' } })
    }
  } else {
    res.status(404).send()
  }
}
