import { utils } from 'ethers'
import { Banners } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const banner = await Banners.findOne({ text: 'banner|free-premium' })
    if (banner) {
      const redeemed = banner.meta.map(({ address }) => address)
      const result = banner.address.map(address => redeemed.includes(address) ? { address, redeemed: true } : { address })
      res.json({ result })
    } else {
      res.status(400).json({ error: { code: -32602, message: 'Failed to get free premiums' } })
    }
  } else if (req.method === 'POST') {
    const newAddress = req.body.filter(addr => utils.isAddress(addr)).map(addr => addr.toLowerCase())
    await Banners.findOneAndUpdate({ text: 'banner|free-premium' }, [{ $addFields: { address: { $setUnion: [newAddress, '$address'] } } }])
    res.json({ result: true })
  } else if (req.method === 'DELETE') {
    const address = req.body.address.toLowerCase()
    const result = await Banners.findOneAndUpdate({ text: 'banner|free-premium' }, { $pull: { address, meta: { address } } })
    res.json({ result })
  } else {
    res.status(404).send()
  }
}
