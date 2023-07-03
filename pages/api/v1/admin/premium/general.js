import { PremiumAccounts, PremiumRecords } from 'lib/db'

export default async function handler(req, res) {
  const total = await PremiumAccounts.count()
  const pipeline = [
    {
      $match: { until: { $gt: new Date() } }
    },
    {
      $group: {
        _id: { $arrayElemAt: [{ $split: ['$_id', ':'] }, 1] },
      }
    },
    {
      $group: {
        _id: '',
        total: { $sum: 1 },
      }
    }
  ]
  const result = await PremiumRecords.aggregate(pipeline)

  if (result) {
    res.json({ result: { total, current: result[0].total } })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
