import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getQuery: () => ({
    'events.name': { $eq: 'LOCKED', $nin: ['RELEASED', 'UNLOCKED'] },
    disabled: { $ne: true }
  }),
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released'
})
