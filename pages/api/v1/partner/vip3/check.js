import { Swaps } from 'lib/db'
import { utils } from 'ethers'
import { presets, getStatusFromEvents } from 'lib/swap'
import { stringify } from 'csv-stringify/sync'
import hashes from './hashes.json'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const list = []
    list.push(['Swap ID', 'Status', 'From Address', 'TX Hash', 'Network', 'Amount', 'Service Fee'])

    const swaps = (await Swaps.find({ 'events.hash': { $in: hashes.map(x => x[4]) } })).map(swap => swap._doc)
    for (let hash of hashes) {
      const swap = swaps.find(s => !!s.events.find(e => e.hash === hash[4]))
      const status = getStatusFromEvents(swap.events, swap.expireTs)
      const { from } = presets.parseInOutNetworkTokens(swap.encoded)
      const fromAddr = swap.events.find(e => e.name === 'POSTED')?.signer || swap.fromTo[0]

      list.push([swap._id, status, fromAddr, hash[4], from.network.name, utils.formatUnits(swap.amount, 6), utils.formatUnits(swap.srFee, 6)])
    }

    const csv = stringify(list)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=vip3.csv`)
    res.send(csv)
  }
}
