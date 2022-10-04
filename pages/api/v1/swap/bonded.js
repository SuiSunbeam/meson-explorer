import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getQuery: () => ({
    'events.name': { $eq: 'BONDED', $nin: ['EXECUTED', 'CANCELLED'] },
    disabled: { $ne: true }
  }),
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released'
})
