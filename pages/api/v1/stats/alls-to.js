import { AllsTo } from 'lib/db'

export default async function handler(req, res) {
  const result = await AllsTo.find({}).sort({ clicks: -1 }).select('addr key did name avatar networkId tokens clicks')

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get alls-to stats' } })
  }
}
