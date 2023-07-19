import { Swaps } from 'lib/db'
import { getSwapId } from 'lib/swap'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const [p0, p1] = req.query.idOrEncoded.split(':', 2)
    const idOrEncoded = p1 ? getSwapId(p0, p1) : p0

    let swap = await Swaps.findById(idOrEncoded)
    if (!swap) {
      swap = await Swaps.findOne({ encoded: idOrEncoded })
    }

    if (swap) {
      res.json({ result: swap })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Swap not found' } })
    }
  } else if (req.method === 'PUT') {
    const swapId = req.query.idOrEncoded
    const { recipient } = req.body
    await Swaps.findByIdAndUpdate(swapId, { 'fromTo.1': recipient })
    res.json({ success: true })
  } else if (req.method === 'OPTIONS') {
    res.end()
  } else {
    res.status(404).send()
  }
}