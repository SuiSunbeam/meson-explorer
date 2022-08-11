import { Swaps, Shares, ShareCodes } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await post(req, res)
  } else if (req.method === 'PUT') {
    return await put(req, res)
  } else if (req.method === 'OPTIONS') {
    res.end()
    return
  }

  res.status(404).send()
}

async function post(req, res) {
  const { swapId, locale = 'en' } = req.query
  const swap = await Swaps.findById(swapId)
  if (!swap) {
    res.status(400).json({ error: { code: -32602, message: 'Failed to get swap data' } })
    return
  }

  const styles = []
  let text = 'Share the poster to friends'
  if (swap.salt.charAt(4) === 'f') {
    if (swap.outChain !== '0x0a0a' || swap.amount < 5_000000) {
      res.status(400).json({ error: { code: -32602, message: 'Failed to create share code' } })
      return
    }
    styles.push('cashback-aurora')
    text = 'Earn cash back by sharing the poster on Twitter with <b>@mesonfi</b> and tag <b>3 friends</b>.'
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

  const properData = _swapHasProperData(swap)
  // if (swap.outChain === '0x0a0a') {
  //   styles.push('aurora')
  // } else
  if (swap.outChain === '0x2329' && properData) {
    styles.push('arbitrum')
  }

  if (['ar', 'fa'].includes(locale)) {
    styles.push('v2-rtl')
    if (properData) {
      styles.push('rtl')
    }
  } else {
    styles.push('v2')
    if (properData) {
      styles.push('default')
    }
  }

  let shareCode = await ShareCodes.findById(swapId)
  if (!shareCode) {
    shareCode = await ShareCodes.create({
      _id: swapId,
      code: `${share._id}${share.seq}`,
      style: styles[0],
      encoded: swap.encoded,
      duration: properData?.duration,
      locale,
      n: 0,
      expires: Date.now() + 7 * 86400_000
    })
    await Shares.findByIdAndUpdate(share._id, { $inc: { seq: 1 } })
  }

  const result = {
    code: shareCode.code,
    styles,
    text,
    address,
    encoded: swap.encoded,
    ...properData
  }

  res.status(200).json({ result })
}

async function put(req, res) {
  const { swapId } = req.query
  const { style } = req.body

  if (!['v2', 'v2-rtl', 'uct', 'default', 'rtl', 'aurora', 'arbitrum', 'cashback-avax'].includes(style)) {
    res.status(400).send()
    return
  }

  await ShareCodes.findByIdAndUpdate(swapId, { $set: { style } })
  res.status(200).json({ result: true })
}

function _swapHasProperData(swap) {
  const duration = Math.floor((swap.released - swap.created) / 1000)
  if (duration <= 240 && duration >= 20 && swap.fee < 2_000_000 && swap.inToken < 3) {
    return {
      duration
    }
  }
}