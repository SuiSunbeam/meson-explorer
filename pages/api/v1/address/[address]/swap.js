import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getQuery: req => ({ fromTo: req.query.address, disabled: { $ne: true } }),
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released srFee lpFee'
})
