import { Premiums, Swaps } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const query = req.query
    const result = await _getExpiredList(query)
    res.json({ result })
  } else {
  }
}

async function _getExpiredList(query) {
  const hasQuery = Object.keys(query).length > 0
  const ltGroup = await Premiums.find({ until: { $lt: new Date() } }).select('initiator')  || []
  const gtGroup = await Premiums.find({ until: { $gt: new Date() } }).select('initiator') || []

  const newerList = gtGroup.map(item => item.initiator)
  const expiredList = ltGroup.filter(item => !newerList.includes(item.initiator))

  if (!hasQuery) {
    return expiredList
  }

  const claim = query.claim

  if (claim) {
    const claimedExpired = await Premiums.find({ until: { $lte: new Date() }, 'params.roleClaimed': true }).select('initiator params')
    return claimedExpired?.filter(item => !newerList.includes(item.initiator))
  } else {
    return []
  }
}
