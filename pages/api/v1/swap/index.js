import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { disabled: { $ne: true }, hide: { $ne: true } }
    if (roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')) {
      delete query.hide
      const { category, from, to } = req.query
      if (category === 'api') {
        query.salt = { $regex : /^0x[d9]/ }
      } else if (category === 'meson.to') {
        query.salt = { $regex : /^0x[ea62]/ }
      } else if (category === 'contract') {
        query.fromContract = true
      } else if (category === 'campaign') {
        query.salt = { $regex : /^0x[0-8a-f]{2}f/ }
      }
      if (from) {
        query.inChain = presets.getNetwork(from).shortSlip44
      }
      if (to) {
        query.outChain = presets.getNetwork(to).shortSlip44
      }
    }
    return query
  },
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released srFee lpFee'
})
