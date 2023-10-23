import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'

export default listHandler({
  collection: Swaps,
  maxPageSize: 100,
  getAggregator: req => {
    const { from, to } = req.query
    const aggregator = [
      {
        $match: {
          errorConfirmed: { $ne: true },
          modified: { $ne: true },
          disabled: { $ne: true }
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
  select: 'encoded events initiator fromTo created released srFee lpFee locks unlocks releases'
})
