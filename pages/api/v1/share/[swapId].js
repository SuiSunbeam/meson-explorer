import { Swaps, Shares, ShareCodes } from '../../../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).send()
    return
  }

  const swapId = req.query.swapId
  const swap = await Swaps.findById(swapId)
  if (!swap) {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get swap data' } })
    return
  }

  const duration = Math.floor((swap.released - swap.created) / 1000)
  if (duration > 99) {
    res.status(400).json({ error: { code: -32602, message: 'Failed to create share code' } })
    return
  }

  const address = swap.fromTo[0]
  let share = await Shares.findOne({ address })
  if (!share) {
    share = await Shares.findOneAndUpdate({ address: { $exists: false } }, { $set: { address } }, { new: true })
  }
  if (!share) {
    res.status(400).json({ error: { code: -32602, message: 'Failed to create share code' } })
    return
  }

  let shareCode = await ShareCodes.findById(swapId)
  if (!shareCode) {
    shareCode = await ShareCodes.create({
      _id: swapId,
      code: `${share._id}${share.seq}`,
      n: 0,
      expires: Date.now() + 3 * 86400_000
    })
    await Shares.findByIdAndUpdate(share._id, { $inc: { seq: 1 } })
  }

  const result = {
    address,
    encoded: swap.encoded,
    duration,
    code: shareCode.code
  }

  res.json({ result })
}
