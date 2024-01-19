import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'
import { SWAP_RES_FIELDS } from 'lib/const'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { fromTo: req.query.address, disabled: { $exists: false } }
    if (roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')) {
      delete query.disabled
      const { from, to, failed } = req.query
      if (from) {
        query.inChain = presets.getNetwork(from).shortSlip44
      }
      if (to) {
        query.outChain = presets.getNetwork(to).shortSlip44
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
