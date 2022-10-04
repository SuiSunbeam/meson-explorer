import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getQuery: () => ({
    $or: [
      { 'events.name': { $eq: 'RELEASED', $ne: 'EXECUTED' } },
      { 'events.name': { $eq: 'EXECUTED', $ne: 'RELEASED' } }
    ],
    disabled: { $ne: true }
  }),
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released'
})
