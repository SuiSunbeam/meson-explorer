import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  const [chain, type] = req.query.params || []

  const pipeline = [
    {
      $match: {
        disabled: { $ne: true }
      }
    },
    {
      $project: {
        success: { $in: ['RELEASED', '$events.name'] },
        amount: { $toLong: '$amount' },
        srFee: { $toLong: '$srFee' },
        lpFee: { $toLong: '$lpFee' },
        duration: { $toLong: { $divide: [{ $subtract: ['$released', '$created'] }, 1000] } },
        date: { $dateToString: { date: '$created', format: '%Y-%m-%d' } },
        fromAddress: { $arrayElemAt: ['$fromTo', 0] },
        isApiSwap: { $in: [{ $substr: ['$salt', 2, 1 ] }, ['d', '9']] },
        isM2Swap: { $in: [{ $substr: ['$salt', 2, 1 ] }, ['e', 'a', '6', '2']] },
        isA2Swap: { $in: [{ $substr: ['$salt', 2, 1 ] }, ['e', 'a']] },
      }
    },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
        success: { $sum: { $cond: ['$success', 1, 0] } },
        apiCount: { $sum: { $cond: ['$isApiSwap', 1, 0] } },
        apiSuccess: { $sum: { $cond: [{ $and: ['$isApiSwap', '$success'] }, 1, 0] } },
        m2Count: { $sum: { $cond: ['$isM2Swap', 1, 0] } },
        m2Success: { $sum: { $cond: [{ $and: ['$isM2Swap', '$success'] }, 1, 0] } },
        a2Count: { $sum: { $cond: ['$isA2Swap', 1, 0] } },
        a2Success: { $sum: { $cond: [{ $and: ['$isA2Swap', '$success'] }, 1, 0] } },
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
        apiCount: '$apiCount',
        apiSuccess: '$apiSuccess',
        m2Count: '$m2Count',
        m2Success: '$m2Success',
        a2Count: '$a2Count',
        a2Success: '$a2Success',
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
