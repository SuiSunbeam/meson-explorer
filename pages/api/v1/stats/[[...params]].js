import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getAggregator: async req => {
    const page = Number(req.query.page) || 0

    const now = new Date()
    const y = now.getUTCFullYear()
    const m = now.getUTCMonth()
    const startDate = new Date(Date.UTC(y, m - page, 1))
    const endDate = new Date(Date.UTC(y, m - page + 1, 1))
    const firstSwap = await Swaps.findOne({ $ne: true }).sort({ created: 1 })
    const launchDate = firstSwap.created
    const maxPage = (y - launchDate.getUTCFullYear()) * 12 + m - launchDate.getUTCMonth() + 1

    const { token, params = [] } = req.query
    const [chain, type] = params

    const aggregator = [
      {
        $match: {
          disabled: { $ne: true },
          created: { $gt: startDate, $lt: endDate }
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
    if (token === 'usd') {
      aggregator[0].$match.$and = [{
        $or: [
          { inToken: { $lte: 64 } },
          { expireTs: { $lt: new Date(1691700000 * 1000) } }
        ]
      }]
    } else if (token === 'eth') {
      aggregator[0].$match.inToken = { $gte: 252 }
      aggregator[0].$match.expireTs = { $gt: new Date(1691700000 * 1000) }
    } else if (token === 'bnb') {
      aggregator[0].$match.inToken = { $gte: 248, $lt: 252 }
    }
    if (chain) {
      if (type === 'from') {
        aggregator[0].$match.inChain = chain
      } else if (type === 'to') {
        aggregator[0].$match.outChain = chain
      } else if (!type || type === 'both') {
        aggregator[0].$match.$or = [{ outChain: chain }, { inChain: chain }]
      }
    }

    return { aggregator, maxPage }
  }
})
