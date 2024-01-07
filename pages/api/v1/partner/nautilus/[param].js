import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getAggregator: async req => {
    const param = req.query.param
    let matchChain
    if (param === 'from') {
      matchChain = { inChain: '0x56ce' }
    } else if (param === 'to') {
      matchChain = { outChain: '0x56ce' }
    } else if (param === 'both') {
      matchChain = { $or: [{ outChain: '0x56ce' }, { inChain: '0x56ce' }] }
    } else {
      return
    }

    const page = Number(req.query.page) || 0

    const now = new Date()
    const y = now.getUTCFullYear()
    const m = now.getUTCMonth()
    const startDate = new Date(Date.UTC(y, m - page, 1))
    const endDate = new Date(Date.UTC(y, m - page + 1, 1))
    const firstSwap = await Swaps.findOne({ $ne: true }).sort({ created: 1 })
    const launchDate = firstSwap.created
    const maxPage = (y - launchDate.getUTCFullYear()) * 12 + m - launchDate.getUTCMonth() + 1

    const aggregator = [
      {
        $match: {
          disabled: { $exists: false },
          released: { $exists: true },
          ...matchChain,
          // created: { $gt: startDate, $lt: endDate },
        }
      },
      {
        $project: {
          amount: { $toLong: '$amount' },
          srFee: { $toLong: '$srFee' },
          lpFee: { $toLong: '$lpFee' },
          duration: { $toLong: { $divide: [{ $subtract: ['$released', '$created'] }, 1000] } },
          date: { $dateToString: { date: '$created', format: '%Y-%m-%d' } },
          fromAddress: { $arrayElemAt: ['$fromTo', 0] },
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
          srFee: { $sum: '$srFee' },
          lpFee: { $sum: '$lpFee' },
          addresses: { $addToSet: '$fromAddress' },
          duration: { $avg: { $cond: [{ $lt: ['$duration', 600] }, '$duration', undefined] } }
        }
      },
      {
        $project: {
          count: '$count',
          success: '$success',
          volume: { $divide: ['$volume', 1e6] },
          // srFee: '$srFee',
          // lpFee: '$lpFee',
          addresses: { $size: '$addresses' },
          duration: { $toInt: '$duration' }
        }
      },
      { $sort: { _id: -1 } }
    ]
    // if (chain) {
    //   if (type === 'from') {
    //     aggregator[0].$match.inChain = chain
    //   } else if (type === 'to') {
    //     aggregator[0].$match.outChain = chain
    //   } else if (!type || type === 'both') {
    //     aggregator[0].$match.$or = [{ outChain: chain }, { inChain: chain }]
    //   }
    // }

    return { aggregator }
  }
})
