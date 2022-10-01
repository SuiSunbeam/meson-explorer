import { Premiums } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    { $match: { meta: { $exists: true } } },
    {
      $project: {
        date: {
          $dateToString: {
            date: { $toDate: { $multiply: ['$meta.ts', 1000] } },
            format: '%Y-%m-%d'
          }
        },
        renew: {
          $lt: [{ $multiply: ['$meta.ts', 1000] }, { $toLong: '$since' }]
        }
      }
    },
    {
      $group: {
        _id: '$date',
        buy: { $sum: { $cond: ['$renew', 0, 1] } },
        renew: { $sum: { $cond: ['$renew', 1, 0] } }
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
