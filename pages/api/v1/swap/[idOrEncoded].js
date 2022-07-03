import { Swaps } from 'lib/db'
import { getSwapId } from 'lib/swap'

export default async function handler(req, res) {
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
}