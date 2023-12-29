import { utils } from 'ethers'
import { Swaps } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let q = req.query.q
    const swap = await Swaps.findOne({ $or: [{ _id: q }, { encoded: q }, { 'events.hash': q }] })
    if (swap) {
      res.json({ result: { swapId: swap._id } })
      return
    }

    if (utils.isAddress(q)) {
      q = q.toLowerCase()
    }

    const swapByAddr = await Swaps.findOne({ fromTo: q })
    if (swapByAddr) {
      res.json({ result: { address: q } })
      return
    }

    res.status(404).json({ error: { code: -32602, message: 'Swap not found' } })
  } else {
    res.status(404).send()
  }
}
