import { Rules } from 'lib/db'

export default async function handler(req, res) {
  const id = req.query.id
  if (req.method === 'PUT') {
    const result = await Rules.findByIdAndUpdate(id, { $set: req.body }, { new: true })
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to modify rule' } })
    }
  } else if (req.method === 'DELETE') {
    const result = await Rules.deleteOne({ _id: id })
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to delete rule' } })
    }
  } else {
    res.status(404).send()
  }
}
