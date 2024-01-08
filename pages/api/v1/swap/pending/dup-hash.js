import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'
import { SWAP_RES_FIELDS } from 'lib/const'

export default listHandler({
  collection: Swaps,
  getAggregator: req => {
    const { from, to } = req.query
    const aggregator = [
      {
        $match: {
          errorConfirmed: { $ne: true },
          modified: { $ne: true },
          disabled: { $exists: false }
        }
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
    ]
    if (from) {
      aggregator[0].$match.inChain = presets.getNetwork(from).shortSlip44
    }
    if (to) {
      aggregator[0].$match.outChain = presets.getNetwork(to).shortSlip44
    }
    return { aggregator, maxPage: 1 }
  },
  sort: { created: -1 },
  select: SWAP_RES_FIELDS
})
