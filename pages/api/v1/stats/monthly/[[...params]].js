import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { AUTO_ADDRESSES } from 'lib/const'

export default listHandler({
  collection: Swaps,
  getAggregator: async req => {
    const { token, params = [] } = req.query
    const [chain, type] = params

    const aggregator = [
      {
        $project: {
          success: { $in: ['RELEASED', '$events.name'] },
          amount: { $toLong: '$amount' },
          fee: { $toLong: { $add: ['$srFee', '$lpFee'] } },
          month: { $dateToString: { date: '$created', format: '%Y/%m' } },
          fromAddress: { $arrayElemAt: ['$fromTo', 0] },
          api: { $and: [
            { $in: [{ $substr: ['$salt', 2, 1 ] }, ['d', '9']] },
            { $not: { $anyElementTrue: { $setIntersection: ['$fromTo', AUTO_ADDRESSES] } } }
          ]},
          auto: { $and: [
            { $in: [{ $substr: ['$salt', 2, 1 ] }, ['d', '9']] },
            { $anyElementTrue: { $setIntersection: ['$fromTo', AUTO_ADDRESSES] } },
          ]},
          m2: { $in: [{ $substr: ['$salt', 2, 1 ] }, ['e', 'a', '6', '2']] },
          isUSD: {
            $or: [
              { $lte: ['$inToken', 64] },
              { $lt: ['$expireTs', new Date(1691700000 * 1000)] },
            ],
          },
          isBTC: {
            $and: [
              { $gte: ['$inToken', 240] },
              { $lt: ['$inToken', 244] },
            ],
          },
          isETH: {
            $and: [
              { $gte: ['$inToken', 252] },
              { $gt: ['$expireTs', new Date(1691700000 * 1000)] },
            ],
          },
          isBNB: {
            $and: [
              { $gte: ['$inToken', 248] },
              { $lt: ['$inToken', 252] },
            ],
          }
        }
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: { $cond: ['$success', 1, 0] } },
          api: { $sum: { $cond: [{ $and: ['$api', '$success'] }, 1, 0] } },
          auto: { $sum: { $cond: [{ $and: ['$auto', '$success'] }, 1, 0] } },
          m2: { $sum: { $cond: [{ $and: ['$m2', '$success'] }, 1, 0] } },
          vol_usd: { $sum: { $cond: [{ $and: ['$isUSD', '$success'] }, '$amount', 0] } },
          fee_usd: { $sum: { $cond: [{ $and: ['$isUSD', '$success'] }, '$fee', 0] } },
          vol_btc: { $sum: { $cond: [{ $and: ['$isBTC', '$success'] }, '$amount', 0] } },
          fee_btc: { $sum: { $cond: [{ $and: ['$isBTC', '$success'] }, '$fee', 0] } },
          vol_eth: { $sum: { $cond: [{ $and: ['$isETH', '$success'] }, '$amount', 0] } },
          fee_eth: { $sum: { $cond: [{ $and: ['$isETH', '$success'] }, '$fee', 0] } },
          vol_bnb: { $sum: { $cond: [{ $and: ['$isBNB', '$success'] }, '$amount', 0] } },
          fee_bnb: { $sum: { $cond: [{ $and: ['$isBNB', '$success'] }, '$fee', 0] } },
          srFee: { $sum: { $cond: ['$success', '$srFee', 0] } },
          lpFee: { $sum: { $cond: ['$success', '$lpFee', 0] } },
          addresses: { $addToSet: '$fromAddress' },
        }
      },
      {
        $project: {
          count: '$count',
          api: '$api',
          auto: '$auto',
          m2: '$m2',
          vol_usd: '$vol_usd',
          fee_usd: '$fee_usd',
          vol_btc: '$vol_btc',
          fee_btc: '$fee_btc',
          vol_eth: '$vol_eth',
          fee_eth: '$fee_eth',
          vol_bnb: '$vol_bnb',
          fee_bnb: '$fee_bnb',
          addresses: { $size: '$addresses' },
        }
      },
      { $sort: { _id: -1 } }
    ]
    if (token === 'usd') {
      aggregator[0].$match.$and = [{
        $or: [
          { inToken: { $lte: 64 } },
          { expireTs: { $lt: new Date(1691700000 * 1000) } }
        ],
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

    return { aggregator }
  }
})
