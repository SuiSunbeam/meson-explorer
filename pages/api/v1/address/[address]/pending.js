import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  const address = req.query.address
  const since = Date.now() - 7200_000
  const query = {
    'fromTo.0': address,
    $or: [
      { updated: { $gt: since } },
      { 'events.name': { $eq: 'BONDED', $nin: ['RELEASED', 'CANCELLED'] } },
    ],
    disabled: { $ne: true }
  }
  
  const list = await Swaps.find(query)
    .select('encoded events initiator fromTo created released srFee lpFee')
    .sort({ created: -1 })
    .exec()

  res.json({ result: { total: list.length, list } })
}