import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'
import { SWAP_RES_FIELDS, AUTO_ADDRESSES } from 'lib/const'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { disabled: { $ne: true }, hide: { $ne: true } }
    if (true || roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')) {
      delete query.hide
      const { category, from, to, token = '', failed } = req.query
      if (category === 'with-gas') {
        query.salt = { $regex : /^0x[0-9a-f][4c]/ }
      } else if (category === 'api') {
        query.salt = { $regex : /^0x[d9]/ }
        query.fromTo = { $nin: AUTO_ADDRESSES }
        query.fromContract = { $ne: true }
      } else if (category === 'contract') {
        query.fromContract = true
      } else if (category === 'auto') {
        query.salt = { $regex : /^0x[d9]/ }
        query.fromTo = { $in: AUTO_ADDRESSES }
      } else if (category === 'meson.to') {
        query.salt = { $regex : /^0x[ea62]/ }
      } else if (category?.startsWith('track:')) {
        const [_, trackIdStr] = category.split(':')
        const trackId = Number(trackIdStr)
        if (trackId) {
          const regex = new RegExp(`^0x[0-9a-f]{3}${trackId}`)
          query.salt = { $regex: regex }
        }
      } else if (category === 'campaign') {
        query.salt = { $regex : /^0x[0-9a-f]{2}f/ }
      }
      if (from) {
        query.inChain = presets.getNetwork(from).shortSlip44
      }
      if (to) {
        query.outChain = presets.getNetwork(to).shortSlip44
      }
      if (token.toLowerCase() === 'eth') {
        query.inToken = { $gte: 252 }
        query.expireTs = { $gt: new Date(1691700000 * 1000) }
      }
      if (token.toLowerCase() === 'bnb') {
        query.inToken = { $gte: 248, $lt: 252 }
      }
      if (failed) {
        query['events.name'] = { $ne: 'RELEASED' }
      }
    }
    return query
  },
  sort: { created: -1 },
  select: SWAP_RES_FIELDS
})
