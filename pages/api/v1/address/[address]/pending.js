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
  
  const rawList = await Swaps.find(query)
    .select('encoded events initiator fromTo created released srFee lpFee inToken amount')
    .sort({ created: -1 })
    .exec()
  
  const list = rawList.filter(item => {
    if (item.inToken == 255 && item.amount > 10_000_000) {
      return
    }
    const cloned = { ...item._doc }
    delete cloned.inToken
    delete cloned.amount
    return cloned
  }).filter(Boolean)

  res.json({ result: { total: list.length, list } })
}