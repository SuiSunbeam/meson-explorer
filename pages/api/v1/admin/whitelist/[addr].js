import { LpWhitelist } from 'lib/db'

export default async function handler(req, res) {
  const { addr } = req.query
  if (req.method === 'PUT') {
    const update = { $set: req.body }
    const result = await LpWhitelist.findByIdAndUpdate(addr, update, { new: true })
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to modify whitelist entry' } })
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await LpWhitelist.findByIdAndRemove(addr)
      res.json({ result })
    } catch (e) {
      console.warn(e)
      res.status(400).json({ error: { code: -32602, message: 'Failed to delete whitelist entry' } })
    }
  } else {
    res.status(404).send()
  }
}
