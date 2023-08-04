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
        api: { $and: [
          { $in: [{ $substr: ['$salt', 2, 1 ] }, ['d', '9']] },
          { $not: { $in: [{ $arrayElemAt: ['$fromTo', 0] }, ['0x666d6b8a44d226150ca9058beebafe0e3ac065a2', '0x4fc928e89435f13b3dbf49598f9ffe20c4439cad']] } }
        ]},
        auto: { $and: [
          { $in: [{ $substr: ['$salt', 2, 1 ] }, ['d', '9']] },
          { $in: [{ $arrayElemAt: ['$fromTo', 0] }, ['0x666d6b8a44d226150ca9058beebafe0e3ac065a2', '0x4fc928e89435f13b3dbf49598f9ffe20c4439cad']] }
        ]},
        m2: { $in: [{ $substr: ['$salt', 2, 1 ] }, ['e', 'a', '6', '2']] },
        a2: { $in: [{ $substr: ['$salt', 2, 1 ] }, ['e', 'a']] },
      }
    },
    {
      $group: {
        _id: '$date',
        count: { $sum: 1 },
        success: { $sum: { $cond: ['$success', 1, 0] } },
        api: { $sum: { $cond: ['$api', 1, 0] } },
        apiSuccess: { $sum: { $cond: [{ $and: ['$api', '$success'] }, 1, 0] } },
        auto: { $sum: { $cond: ['$auto', 1, 0] } },
        autoSuccess: { $sum: { $cond: [{ $and: ['$auto', '$success'] }, 1, 0] } },
        m2: { $sum: { $cond: ['$m2', 1, 0] } },
        m2Success: { $sum: { $cond: [{ $and: ['$m2', '$success'] }, 1, 0] } },
        a2: { $sum: { $cond: ['$a2', 1, 0] } },
        a2Success: { $sum: { $cond: [{ $and: ['$a2', '$success'] }, 1, 0] } },
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
        api: { count: '$api', success: '$apiSuccess' },
        auto: { count: '$auto', success: '$autoSuccess' },
        m2: { count: '$m2', success: '$m2Success' },
        a2: { count: '$a2', success: '$a2Success' },
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
