import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    {
      $project: {
        success: { $gt: ['$released', null] },
        amount: { $toLong: '$amount' },
        duration: { $toLong: { $divide: [{ $subtract: ['$released', '$created'] }, 1000] } },
        date: { $dateToString: { date: '$created', format: '%Y-%m-%d' } }
      }
    },
    {
      $group: {
        _id: '',
        count: { $sum: 1 },
        success: { $sum: { $cond: ['$success', 1, 0] } },
        volume: { $sum: { $cond: ['$success', '$amount', 0] } },
        duration: { $avg: { $cond: [{ $and: ['$success', { $lt: ['$duration', 600] }] }, '$duration', undefined] } }
      }
    }
  ]
  const pipeline2 = [
    { $match: { released: { $exists: true } } },
    { $group: { _id: { $arrayElemAt: ['$fromTo', 0] } } },
    { $count: 'count' }
  ]
  const result = (await Swaps.aggregate(pipeline).exec())[0]
  const result2 = (await Swaps.aggregate(pipeline2).exec())[0]
  delete result._id
  result.addresses = result2.count

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
