import { Swaps } from 'lib/db'
import { listHandler } from 'lib/api'
import { presets } from 'lib/swap'

export default listHandler({
  collection: Swaps,
  getQuery: req => {
    const query = {
      disabled: { $ne: true },
      released: { $exists: true },
      'fromTo.1': req.query.addr?.toLowerCase(),
      outChain: '0x0266',
    }
    return query
  },
  sort: { created: -1 },
  select: '_id encoded amount inChain outChain inToken outToken srFee lpFee',
  postProcessor: list => {
    return list.map(item => {
      const { swap, from, to } = presets.parseInOutNetworkTokens(item.encoded)
      return {
        swapId: item._id,
        amount: swap.amount / 1e6,
        from: { network: from.network.name, token: from.token.symbol },
        to: { network: to.network.name, token: to.token.symbol },
        protocol_fee: item.srFee / 1e6,
        gas_fee: item.lpFee / 1e6,
      }
    })
  },
})
