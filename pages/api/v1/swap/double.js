import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'

export default listHandler({
  collection: Swaps,
  getAggregator: () => [
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
      $match: { locks: { $gt: 1 } }
    }
  ],
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released locks unlocks releases'
})
