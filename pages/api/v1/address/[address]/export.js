import { getToken } from 'next-auth/jwt'
import { stringify } from 'csv-stringify/sync'
import { BigNumber, utils } from 'ethers'

import { Swaps } from 'lib/db'
import { presets, getStatusFromEvents } from 'lib/swap'

export default async function handler(req, res) {
  const roles = (await getToken({ req }))?.roles
  if (!roles?.some(r => ['root', 'admin'].includes(r))) {
    res.status(401)
    res.end()
    return
  }

  const { address } = req.query
  const query = { fromTo: address, disabled: { $exists: false } }
  const rawList = await Swaps.find(query)
    .select('encoded events fromTo created srFee lpFee')
    .sort({ created: 1 })
    .exec()
  
  let balance = BigNumber.from(0)
  const list = rawList.map(item => {
    const { _id, encoded, events, fromTo, created, srFee, lpFee } = item
    const { swap, from, to } = presets.parseInOutNetworkTokens(encoded)
    const status = getStatusFromEvents(events, swap.expireTs)
    const amount = utils.formatUnits(swap.amount, 6)
    const fee = utils.formatUnits((srFee || 0) + (lpFee || 0), 6)
    if (status === 'DONE') {
      if (to.network.id === 'cfx' && fromTo[1] === address) {
        balance = balance.add(swap.amount).sub((srFee || 0) + (lpFee || 0))
      } else if (from.network.id === 'cfx' && fromTo[0] === address) {
        balance = balance.sub(swap.amount)
      }
    }
    return [
      _id, new Date(created).toISOString(), status,
      amount, fee, utils.formatUnits(balance, 6),
      from.network.name, from.token.symbol, to.network.name, to.token.symbol,
      fromTo[0], fromTo[1]
    ]
  })

  list.push([
    'Swap ID', 'Created Time', 'Status', 'Amount', 'Fee', 'Balance',
    'From', 'From Token', 'To', 'To Token',
    'Sender', 'Recipient'
  ])

  const csv = stringify(list.reverse())

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=meson_swaps_${req.query.address}.csv`)
  res.send(csv)
}