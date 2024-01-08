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
          locks: {
            $size: { 
              $filter: {
                input: '$events.name',
                cond: { $in: [ '$$this', ['LOCKED'] ] }
              }
            }
          },
          unlocks: {
            $size: { 
              $filter: {
                input: '$events.name',
                cond: { $in: [ '$$this', ['UNLOCKED'] ] }
              }
            }
          },
          releases: {
            $size: { 
              $filter: {
                input: '$events.name',
                cond: { $in: [ '$$this', ['RELEASED'] ] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          extra: { $subtract: ['$locks', { $sum: ['$unlocks', '$releases'] }] }
        }
      },
      {
        $match: { extra: { $gt: 0 }, locks: { $gt: 1 } }
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
  select: `${SWAP_RES_FIELDS} locks unlocks releases`
})
