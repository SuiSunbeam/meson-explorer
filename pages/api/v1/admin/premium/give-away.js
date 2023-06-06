import { utils } from 'ethers'
import { Banners } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const banner = await Banners.findById('free-premium')
    if (banner) {
      res.json({ result: banner.metadata })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get free premiums' } })
    }
  } else if (req.method === 'POST') {
    const banner = await Banners.findById('free-premium')
    if (!banner) {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get free premiums' } })
      return
    }
    const newAddress = req.body
      .map(addr => addr.toLowerCase())
      .filter(addr => utils.isAddress(addr) && !banner.metadata.find(item => item.address === addr))
      .map(address => ({ address }))
    await Banners.findByIdAndUpdate('free-premium', { $addToSet: { metadata: { $each: newAddress } } })
    res.json({ result: true })
  } else if (req.method === 'DELETE') {
    const address = req.body.address.toLowerCase()
    const result = await Banners.findByIdAndUpdate('free-premium', { $pull: { metadata: { address } } })
    res.json({ result })
  } else {
    res.status(404).send()
  }
}
