import { Banners, Swaps } from 'lib/db'
import mesonPresets from '@mesonfi/presets'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const result = await get()
    if (result) {
      res.json({ result })
    } else {
      res.status(404).send()
    }
  } else {
    res.status(404).send()
  }
}

async function get() {
  const banner = await Banners.findOne({ text: 'banner|cash-back', disabled: { $ne: false } })
    .sort({ priority: -1 })
    .select('params')
    .exec()


  if (banner) {
    const currentBanner = banner._doc
    const { networkId, min, startDate, endDate } = currentBanner?.params || {}
    const shortSlip44ID = mesonPresets.getNetwork(networkId)?.shortSlip44

    if (!shortSlip44ID) {
      return null
    }

    const query = {
      outChain: shortSlip44ID,
      amount: {
        $gte: min * 1000_000
      },
      created: {
        $gt: new Date(startDate),
        $lt: new Date(endDate)
      }
    }

    const rawList = await Swaps.find(query)
      .select('encoded fromTo')
      .exec()

    return rawList
  } else {
    return null
  }
}
