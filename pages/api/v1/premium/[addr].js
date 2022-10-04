import { Premiums } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Premiums,
  getQuery: req => ({ initiator: req.query.addr }),
  sort: { 'meta.ts': -1 }
})
