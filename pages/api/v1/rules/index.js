import { Rules } from '../../../../lib/db'

export default async function handler(req, res) {
  const result = await Rules.find().sort({ priority: -1 }).exec()
  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get rules' } })
  }
}
