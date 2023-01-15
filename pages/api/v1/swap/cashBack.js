import { Banners, Swaps } from 'lib/db'
import mesonPresets from '@mesonfi/presets'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query
    const result = await get(address)
    if (result) {
      res.json({ result })
    } else {
      res.status(404).send()
    }
  } else {
    res.status(404).send()
  }
}

async function get(address) {
  const cashbackBanners = await Banners.aggregate([
    { $match: { disabled: false, text: 'banner|cash-back' } },
  ])

  const banner = cashbackBanners[0]

  if (banner) {
    const { networkId, min, startDate, endDate, from } = banner?.params || {}
    const shortSlip44ID = mesonPresets.getNetwork(networkId)?.shortSlip44

    if (!shortSlip44ID) {
      return null
    }

    let query = {
      amount: {
        $gte: min * 1000_000
      },
      created: {
        $gt: new Date(startDate),
        $lt: new Date(endDate)
      },
      ... from ? { inChain: shortSlip44ID } : { outChain: shortSlip44ID }
    }

    if (address) {
      query = {
        ...query,
        'fromTo.0': address
      }
      return await Swaps.findOne(query).select('fromTo').exec()
    } else {
      return await Swaps.find(query).select('fromTo').exec()
    }
  } else {
    return null
  }
}

