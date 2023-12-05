import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'
import { getTimeQuery } from './lib'

export default listHandler({
  collection: Swaps,
  getQuery: req => {
  const { addr = '', start, end } = req.query
  const recipient = addr.toLowerCase()
  const query = {
      disabled: { $ne: true },
      released: { $exists: true },
      'fromTo.1': recipient,
      outChain: '0x0266',
      ...getTimeQuery(start, end),
    }
    return query
  },
  sort: { created: -1 },
  select: '_id encoded amount inChain outChain inToken outToken created srFee lpFee',
  postProcessor: list => {
    const factor = recipient === '0x26d178ef81c097c5f8075239b78ba9b9aee0c404'
      ? 1e5
      : 1e6
    return list.map(item => {
      const { swap, from, to } = presets.parseInOutNetworkTokens(item.encoded)
      return {
        swapId: item._id,
        amount: swap.amount / factor,
        from: { network: from.network.name, token: from.token.symbol },
        to: { network: to.network.name, token: to.token.symbol },
        fee: { protocol: item.srFee / factor, gas: item.lpFee / factor },
        created: item.created,
      }
    })
  },
})
