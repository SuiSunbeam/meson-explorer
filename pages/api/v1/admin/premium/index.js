import { PremiumRecords } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: PremiumRecords,
  getQuery: () => ({}),
  sort: { since: -1 }
})
