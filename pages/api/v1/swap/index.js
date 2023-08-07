import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'

export default listHandler({
  collection: Swaps,
  getQuery: (req, roles, headerRoles) => {
    const query = { disabled: { $ne: true }, hide: { $ne: true } }
    if (roles?.some(r => ['root', 'admin'].includes(r)) || headerRoles.includes('data')) {
      delete query.hide
      const { category, from, to, failed } = req.query
      if (category === 'api') {
        query.salt = { $regex : /^0x[d9]/ }
        query['fromTo.0'] = { $nin: ['0x666d6b8a44d226150ca9058beebafe0e3ac065a2', '0x4fc928e89435f13b3dbf49598f9ffe20c4439cad'] }
      } else if (category === 'auto') {
        query.salt = { $regex : /^0x[d9]/ }
        query['fromTo.0'] = { $in: ['0x666d6b8a44d226150ca9058beebafe0e3ac065a2', '0x4fc928e89435f13b3dbf49598f9ffe20c4439cad'] }
      } else if (category === 'meson.to') {
        query.salt = { $regex : /^0x[ea62]/ }
      } else if (category?.startsWith('track:')) {
        const [_, trackIdStr] = category.split(':')
        const trackId = Number(trackIdStr)
        if (trackId) {
          const regex = new RegExp(`^0x[0-9a-f]{3}${trackId}`)
          query.salt = { $regex: regex }
        }
      } else if (category === 'contract') {
        query.fromContract = true
      } else if (category === 'campaign') {
        query.salt = { $regex : /^0x[0-8a-f]{2}f/ }
      }
      if (from) {
        query.inChain = presets.getNetwork(from).shortSlip44
      }
      if (to) {
        query.outChain = presets.getNetwork(to).shortSlip44
      }
      if (failed) {
        query['events.name'] = { $ne: 'RELEASED' }
      }
    }
    return query
  },
  sort: { created: -1 },
  select: 'encoded events initiator fromTo created released srFee lpFee'
})
