import { AllsTo } from 'lib/db'

export default async function handler(req, res) {
  const pipeline = [
    {
      $group: {
        _id: '',
        count: { $sum: 1 },
        link3: { $sum: { $cond: [{ $eq: ['$did', 'link3'] }, 1, 0] } },
        dotbit: { $sum: { $cond: [{ $eq: ['$did', 'dotbit'] }, 1, 0] } },
      }
    }
  ]
  const result = (await AllsTo.aggregate(pipeline).exec())[0]
  delete result._id

  if (result) {
    res.json({ result })
  } else {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get alls-to general' } })
  }
}
