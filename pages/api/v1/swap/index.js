import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getQuery: (_, roles, headerRoles) => {
    return roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')
      ? { disabled: { $ne: true } }
      : { disabled: { $ne: true }, hide: { $ne: true } }
  },
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released'
})
