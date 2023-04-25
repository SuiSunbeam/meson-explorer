import { Banners } from 'lib/db'

export default async function handler(req, res) {
  const { bannerId } = req.query
  if (req.method === 'PUT') {
    const update = { $set: req.body }
    const result = await Banners.findByIdAndUpdate(bannerId, update, { new: true })
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to modify banners' } })
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await Banners.findByIdAndRemove(bannerId)
      res.json({ result })
    } catch (e) {
      console.warn(e)
      res.status(400).json({ error: { code: -32602, message: 'Failed to delete banners' } })
    }
  } else {
    res.status(404).send()
  }
}
