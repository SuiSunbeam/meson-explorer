import { Rules } from 'lib/db'

export default async function handler(req, res) {
  const { id } = req.query
  let query
  if (id.includes('>')) {
    const [from, to] = id.split('>')
    query = { from, to }
  } else {
    query = { _id: id }
  }
  if (req.method === 'PUT') {
    const update = { $set: req.body }
    if (!req.body.limit && req.body.limit !== 0) {
      delete update.$set.limit
      update.$unset = { limit: true }
    }
    if (!req.body.factor && req.body.factor !== 0) {
      delete update.$set.factor
      update.$unset = { ...update.$unset, factor: true }
    }
    const result = await Rules.findOneAndUpdate(query, update, { new: true })
    if (result) {
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to modify rule' } })
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await Rules.deleteOne(query)
      res.json({ result })
    } catch (e) {
      console.warn(e)
      res.status(400).json({ error: { code: -32602, message: 'Failed to delete rule' } })
    }
  } else {
    res.status(404).send()
  }
}
