import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await get(req, res)
  } else {
    res.status(404).send()
  }
}

async function get(req, res) {
  const { trackId = '' } = req.query
  if (!trackId || trackId === '0' || trackId.length > 1) {
    res.status(404).end()
    return
  }
  const regex = new RegExp(`^0x[0-9a-f]{3}${trackId}`, 'i')
  const pipeline = [
    { $match: { salt: { $regex: regex }, inChain: '0x0324', 'events.name': 'RELEASED' } },
    { $group: { _id: { '$arrayElemAt': ['$fromTo', 0] } } },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]

  const from = await Swaps.aggregate(pipeline)
  delete pipeline[0].$match.inChain
  pipeline[0].$match.outChain = '0x0324'
  const to = await Swaps.aggregate(pipeline)
  res.json({ result: { from: from[0].count, to: to[0].count } })
}
