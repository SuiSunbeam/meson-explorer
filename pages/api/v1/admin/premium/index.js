import { Premiums } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Premiums,
  getQuery: () => ({ meta: { $exists: true } }),
  sort: { 'meta.ts': -1 }
})
