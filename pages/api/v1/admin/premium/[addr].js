import { PremiumAccounts, PremiumRecords } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: PremiumRecords,
  getQuery: async req => {
    const { addr } = req.query
    let addressList
    if (addr.startsWith('T')) {
      addressList = [`tron:${addr}`]
    } else if (addr.length === 42) {
      addressList = [`ethers:${addr.toLowerCase()}`]
    } else {
      addressList = [`aptos:${addr}`, `sui:${addr}`]
    }
    const acc = await PremiumAccounts.findOne({ address: { $in: addressList } })
    if (!acc) {
      return { _id: null }
    }
    return { _id: { $gt: `${acc._id}:`, $lt: `${acc._id}:~` } }
  },
  sort: { since: -1 }
})
