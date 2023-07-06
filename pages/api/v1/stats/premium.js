import { PremiumRecords } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    { $unwind: { path: '$txs', includeArrayIndex: 'txIndex', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        ts: {
          $ifNull: [
            { $convert: { input: { $multiply: ['$txs.ts', 1000] }, to: 'date', onError: null } },
            '$since',
            new Date(0),
          ]
        },
        isPremium: { $and: [{ $eq: ['$plan', 'premium'] }, { $lt: ['$txIndex', 1] }] },
        isPlus: { $and: [{ $eq: ['$plan', 'premium-plus'] }, { $lt: ['$txIndex', 1] }] },
        isLite: { $and: [{ $eq: ['$plan', 'premium-lite-0'] }, { $lt: ['$txIndex', 1] }] },
        isExtra: { $eq: ['$txs.erc20Value', '4990000'] },
        // isExtra: { $gt: ['$txIndex', 0] },
      }
    },
    {
      $project: {
        date: { $dateToString: { date: '$ts', format: '%Y-%m-%d' } },
        premium: { $cond: ['$isPremium', 1, 0] },
        plus: { $cond: ['$isPlus', 1, 0] },
        lite: { $cond: ['$isLite', 1, 0] },
        extra: { $cond: ['$isExtra', 1, 0] },
      }
    },
    {
      $group: {
        _id: '$date',
        premium: { $sum: '$premium' },
        plus: { $sum: '$plus' },
        lite: { $sum: '$lite' },
        extra: { $sum: '$extra' },
      }
    },
    { $sort: { _id: -1 } }
  ]
  const result = await PremiumRecords.aggregate(pipeline)

  if (result) {
    res.json({ result: result.filter(item => item.premium + item.plus + item.lite) })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get premium stats' } })
  }
}
