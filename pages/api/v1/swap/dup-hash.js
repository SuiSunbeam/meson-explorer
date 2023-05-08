import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getAggregator: () => [
    {
      $match: { disabled: { $ne: true } }
    },
    {
      $addFields: {
        eventsWithHashes: {
          $filter: {
            input: '$events',
            as: 'event',
            cond: { $ifNull: ['$$event.hash', false] }
          }
        }
      }
    },
    {
      $addFields: {
        uniqueHashes: { $setUnion: '$eventsWithHashes.hash' },
        hashesSize: { $size: '$eventsWithHashes' }
      }
    },
    {
      $addFields: {
        uniqueHashesSize: { $size: '$uniqueHashes' }
      }
    },
    {
      $addFields: {
        isAllUnique: { $eq: ['$uniqueHashesSize', '$hashesSize'] }
      }
    },
    {
      $match: { isAllUnique: false }
    }
  ],
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released'
})
