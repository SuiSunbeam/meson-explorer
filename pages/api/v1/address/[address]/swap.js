import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { fromTo: req.query.address, disabled: { $ne: true } }
    if (roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')) {
      const { from, to } = req.query
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
