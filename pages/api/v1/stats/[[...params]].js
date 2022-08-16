import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  const [chain, type] = req.query.params || []

  const pipeline = [
    {
      $project: {
        success: { $gt: ['$released', null] },
        amount: { $toLong: '$amount' },
        srFee: { $toLong: '$srFee' },
        lpFee: { $toLong: '$lpFee' },
        duration: { $toLong: { $divide: [{ $subtract: ['$released', '$created'] }, 1000] } },
        date: { $dateToString: { date: '$created', format: '%Y-%m-%d' } },
        fromAddress: { $arrayElemAt: ['$fromTo', 0] }
      }
    },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
        success: { $sum: { $cond: ['$success', 1, 0] } },
        volume: { $sum: { $cond: ['$success', '$amount', 0] } },
        srFee: { $sum: { $cond: ['$success', '$srFee', 0] } },
        lpFee: { $sum: { $cond: ['$success', '$lpFee', 0] } },
        addresses: { $addToSet: '$fromAddress' },
        duration: { $avg: { $cond: [{ $and: ['$success', { $lt: ['$duration', 600] }] }, '$duration', undefined] } }
      }
    },
    {
      $project: {
        count: '$count',
        success: '$success',
        volume: '$volume',
        srFee: '$srFee',
        lpFee: '$lpFee',
        addresses: { $size: '$addresses' },
        duration: '$duration'
      }
    },
    { $sort: { _id: -1 } }
  ]
  if (chain) {
    if (type === 'from') {
      pipeline.unshift({ $match: { inChain: chain } })
    } else if (type === 'to') {
      pipeline.unshift({ $match: { outChain: chain } })
    } else if (!type || type === 'both') {
      pipeline.unshift({ $match: { $or: [{ outChain: chain }, { inChain: chain }] } })
    } else {
      return []
    }
  }
  const result = await Swaps.aggregate(pipeline).exec()

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
