import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { disabled: { $ne: true }, hide: { $ne: true } }
    if (roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')) {
      delete query.hide
      const filter = req.query.filter
      if (filter === 'api') {
        query.salt = { $regex : /^0x[d9]/ }
      } else if (filter === 'meson.to') {
        query.salt = { $regex : /^0x[ea62]/ }
      }
    }
    return query
  },
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released'
})
