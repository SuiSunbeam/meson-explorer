import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'
import { SWAP_RES_FIELDS } from 'lib/const'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { shareIndex: req.query.poolIndex, disabled: { $ne: true } }
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
  select: SWAP_RES_FIELDS
})
