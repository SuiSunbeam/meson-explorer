import { Swaps } from '../../../../lib/db'

export default async function handler(req, res) {
  const query = {
    inToken: 255,
    disabled: { $ne: true },
    'events.name': { $eq: 'BONDED', $nin: ['EXECUTED', 'CANCELLED'] },
    created: {$lt: new Date('2022-06-11 00:00:01.000Z')}
  }
  // return await this.Swaps.find(query).select('_id').sort({ created: -1 }).exec()
  // return await Swaps.updateMany(query, { $set: { disabled: true } })
}