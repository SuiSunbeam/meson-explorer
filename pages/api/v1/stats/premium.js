import { PremiumRecords } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    { $unwind: '$txs' },
    {
      $project: {
        ts: { $convert: { input: { $multiply: [{ $ifNull: ['$txs.ts', 0] }, 1000] }, to: 'date', onError: new Date(0) } }
      }
    },
    {
      $project: {
        date: {
          $dateToString: { date: '$ts', format: '%Y-%m-%d' }
        },
        buy: { $cond: ['$paid', 0, 1] },
        buy: { $cond: ['$paid', 0, 1] },
        renew: { $cond: ['$paid', 0, 1] },
        redeem: { $cond: ['$paid', 0, 1] }
      }
    },
    {
      $group: {
        _id: '$date',
        buy: { $sum: '$buy' },
        extra: { $sum: '$extra' },
        renew: { $sum: '$renew' },
        redeem: { $sum: '$redeem' }
      }
    },
    { $sort: { _id: -1 } }
  ]
  const result = await PremiumRecords.aggregate(pipeline)

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get premium stats' } })
  }
}
