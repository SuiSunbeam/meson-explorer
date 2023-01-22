import { Recipients } from 'lib/db'

export default async function handler(req, res) {
  const result = await Recipients.find({}).sort({ n: -1 }).select('uid name networkId tokens avatar clicks')

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get alls-to stats' } })
  }
}
