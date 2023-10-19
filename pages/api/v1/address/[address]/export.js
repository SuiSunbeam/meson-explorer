import { getToken } from 'next-auth/jwt'
import { stringify } from 'csv-stringify/sync'
import { ethers } from 'ethers'

import { Swaps } from 'lib/db'
import { presets, getSwapId, getStatusFromEvents } from 'lib/swap'

export default async function handler(req, res) {
  const roles = (await getToken({ req }))?.roles
  if (!roles?.some(r => ['root', 'admin'].includes(r))) {
    res.status(401)
    res.end()
    return
  }

  const query = { fromTo: req.query.address, disabled: { $ne: true } }
  const rawList = await Swaps.find(query)
    .select('encoded events initiator fromTo created released srFee lpFee')
    .sort({ created: -1 })
    .exec()
  
  const list = rawList.map(item => {
    const { encoded, initiator, created, events, srFee, lpFee, fromTo } = item
    const swapId = getSwapId(encoded, initiator || fromTo[0])
    const { swap, from, to } = presets.parseInOutNetworkTokens(encoded)
    const status = getStatusFromEvents(events, swap.expireTs)
    const amount = ethers.utils.formatUnits(swap.amount, 6)
    const fee = ethers.utils.formatUnits((srFee || 0) + (lpFee || 0), 6)
    return [
      swapId, new Date(created).toISOString(), status,
      amount, fee,
      from.network.name, from.token.symbol, to.network.name, to.token.symbol,
      fromTo[0], fromTo[1]
    ]
  })

  list.unshift([
    'Swap ID', 'Created Time', 'Status', 'Amount', 'Fee',
    'From', 'From Token', 'To', 'To Token',
    'Sender', 'Recipient'
  ])

  const csv = stringify(list)

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=meson_swaps_${req.query.address}.csv`)
  res.send(csv)
}