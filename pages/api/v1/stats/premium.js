import { Premiums } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    {
      $project: {
        paid: { $gt: ['$meta', null] },
        since: '$since',
        ts: { $toDate: { $multiply: [{ $ifNull: ['$meta.ts', { $toLong: 0 }] }, 1000] } }
      }
    },
    {
      $project: {
        date: {
          $dateToString: { date: { $cond: ['$paid', '$ts', '$since'] }, format: '%Y-%m-%d' }
        },
        buy: { $cond: [{ $and: ['$paid', { $gte: ['$ts', '$since'] }] }, 1, 0] },
        renew: { $cond: [{ $and: ['$paid', { $lt: ['$ts', '$since'] }] }, 1, 0] },
        redeem: { $cond: ['$paid', 0, 1] }
      }
    },
    {
      $group: {
        _id: '$date',
        buy: { $sum: '$buy' },
        renew: { $sum: '$renew' },
        redeem: { $sum: '$redeem' }
      }
    },
    { $sort: { _id: -1 } }
  ]
  const result = await Premiums.aggregate(pipeline).exec()

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get premium stats' } })
  }
}
