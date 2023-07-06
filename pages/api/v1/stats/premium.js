import { PremiumRecords } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    {
      $addFields: {
        txs: { $concatArrays: ['$txs', [null]] }
      }
    },
    { $unwind: '$txs' },
    {
      $project: {
        ts: {
          $ifNull: [
            { $convert: { input: { $multiply: ['$txs.ts', 1000] }, to: 'date', onError: null } },
            '$since',
            new Date(0),
          ]
        },
        isPremium: { $cond: ['$txs', { $eq: ['$plan', 'premium'] }, false] },
        isPlus: { $cond: ['$txs', { $eq: ['$plan', 'premium-plus'] }, false] },
        isLite: { $cond: ['$txs', false, { $eq: ['$plan', 'premium-lite-0'] }] },
        isExtra: { $eq: ['$txs.erc20Value', '4990000'] },
      }
    },
    {
      $project: {
        date: {
          $dateToString: { date: '$ts', format: '%Y-%m-%d' }
        },
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
