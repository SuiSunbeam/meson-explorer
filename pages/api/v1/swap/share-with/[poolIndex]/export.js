import { stringify } from 'csv-stringify/sync'
import { BigNumber, utils } from 'ethers'

import { Swaps } from 'lib/db'
import { presets, getStatusFromEvents } from 'lib/swap'

export default async function handler(req, res) {
  const { poolIndex } = req.query
  const query = { shareIndex: poolIndex, disabled: { $exists: false } }
  const rawList = await Swaps.find(query)
    .select('encoded events fromTo created srFee lpFee')
    .sort({ created: 1 })
    .exec()
  
  let accumulated = BigNumber.from(0)
  const list = rawList.map(item => {
    const { _id, encoded, events, fromTo, created, srFee, lpFee } = item
    const { swap, from, to } = presets.parseInOutNetworkTokens(encoded)
    const status = getStatusFromEvents(events, swap.expireTs)
    const amount = utils.formatUnits(swap.amount, 6)
    const fee = utils.formatUnits(swap.amountToShare.add((srFee || 0) + (lpFee || 0)), 6)
    let sharedFee = ''
    if (status === 'DONE') {
      sharedFee = utils.formatUnits(swap.amountToShare, 6)
      accumulated = accumulated.add(swap.amountToShare)
    }
    return [
      _id, new Date(created).toISOString(), status,
      amount, fee, sharedFee, utils.formatUnits(accumulated, 6),
      from.network.name, from.token.symbol, to.network.name, to.token.symbol,
      fromTo[0], fromTo[1]
    ]
  })

  list.push([
    'Swap ID', 'Created Time', 'Status', 'Amount', 'Fee', 'Shared Fee', 'Accumulated Shared Fee',
    'From', 'From Token', 'To', 'To Token',
    'Sender', 'Recipient'
  ])

  const csv = stringify(list.reverse())

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=meson_swaps_shared_with_${poolIndex}.csv`)
  res.send(csv)
}