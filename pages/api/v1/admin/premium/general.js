import { Premiums } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    {
      $addFields: { current: { $cond: [{ $gt: ['$until', new Date()] }, 1, 0] } }
    },
    {
      $group: {
        _id: '$initiator',
        current: { $max: '$current' }
      }
    },
    {
      $group: {
        _id: '',
        total: { $sum: 1 },
        current: { $sum: '$current' }
      }
    }
  ]
  const result = (await Premiums.aggregate(pipeline).exec())[0]
  delete result._id

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get general' } })
  }
}
