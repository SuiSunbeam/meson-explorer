import { AllsTo } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: AllsTo,
  getQuery: () => ({}),
  sort: { clicks: -1 },
  select: 'addr key did name avatar networkId tokens clicks'
})
