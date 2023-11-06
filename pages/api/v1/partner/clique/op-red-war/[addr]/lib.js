import { Swaps } from 'lib/db'

export function getTimeQuery(start, end) {
  const query = { created: {} }
  if (Number(start)) {
    query.created.$gt = new Date(Number(start) * 1000)
  }
  if (Number(end)) {
    query.created.$lt = new Date(Number(end) * 1000)
  }
  if (query.created.$gt || query.created.$lt) {
    return query
  }
}

export async function count(addr = '', query = {}) {
  const pipeline = [
    {
      $match: {
        disabled: { $ne: true },
        released: { $exists: true },
        'fromTo.1': addr.toLowerCase(),
        outChain: '0x0266',
        ...query,
      }
    },
    {
      $addFields: {
        amount: { $toLong: '$amount' },
      }
    },
    {
      $group: {
        _id: '',
        ethCount: { $sum: { $cond: [{ $eq: ['$outToken', 255] }, 1, 0] } },
        ethVolume: { $sum: { $cond: [{ $eq: ['$outToken', 255] }, '$amount', 0] } },
        usdcCount: { $sum: { $cond: [{ $eq: ['$outToken', 1] }, 1, 0] } },
        usdcVolume: { $sum: { $cond: [{ $eq: ['$outToken', 1] }, '$amount', 0] } },
        usdtCount: { $sum: { $cond: [{ $eq: ['$outToken', 2] }, 1, 0] } },
        usdtVolume: { $sum: { $cond: [{ $eq: ['$outToken', 2] }, '$amount', 0] } },
      }
    },
    {
      $project: {
        eth: { count: '$ethCount', volume: { $divide: ['$ethVolume', 1_000_000] } },
        usdc: { count: '$usdcCount', volume: { $divide: ['$usdcVolume', 1_000_000] } },
        usdt: { count: '$usdtCount', volume: { $divide: ['$usdtVolume', 1_000_000] } },
      }
    }
  ]
  const result = (await Swaps.aggregate(pipeline))[0] || {
    eth: { count: 0, volume: 0 },
    usdc: { count: 0, volume: 0 },
    usdt: { count: 0, volume: 0 },
  }
  delete result._id

  return result
}

export async function fee(addr = '', query = {}) {
  const pipeline = [
    {
      $match: {
        disabled: { $ne: true },
        released: { $exists: true },
        'fromTo.1': addr.toLowerCase(),
        outChain: '0x0266',
        ...query,
      }
    },
    {
      $addFields: {
        srFee: { $toLong: '$srFee' },
        lpFee: { $toLong: '$lpFee' },
      }
    },
    {
      $group: {
        _id: '',
        ethSrFee: { $sum: { $cond: [{ $eq: ['$outToken', 255] }, '$srFee', 0] } },
        ethLpFee: { $sum: { $cond: [{ $eq: ['$outToken', 255] }, '$lpFee', 0] } },
        usdcSrFee: { $sum: { $cond: [{ $eq: ['$outToken', 1] }, '$srFee', 0] } },
        usdcLpFee: { $sum: { $cond: [{ $eq: ['$outToken', 1] }, '$lpFee', 0] } },
        usdtSrFee: { $sum: { $cond: [{ $eq: ['$outToken', 2] }, '$srFee', 0] } },
        usdtLpFee: { $sum: { $cond: [{ $eq: ['$outToken', 2] }, '$lpFee', 0] } },
      }
    },
    {
      $project: {
        fee_eth: { protocol: { $divide: ['$ethSrFee', 1_000_000] }, gas: { $divide: ['$ethLpFee', 1_000_000] } },
        fee_usdc: { protocol: { $divide: ['$usdcSrFee', 1_000_000] }, gas: { $divide: ['$usdcLpFee', 1_000_000] } },
        fee_usdt: { protocol: { $divide: ['$usdtSrFee', 1_000_000] }, gas: { $divide: ['$usdtLpFee', 1_000_000] } },
      }
    }
  ]
  const result = (await Swaps.aggregate(pipeline))[0] || {
    fee_eth: { protocol: 0, gas: 0 },
    fee_usdc: { protocol: 0, gas: 0 },
    fee_usdt: { protocol: 0, gas: 0 },
  }
  delete result._id

  return result
}
