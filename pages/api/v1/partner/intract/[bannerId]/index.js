import { Banners } from 'lib/db'

function getBannerQuery (bannerId) {
  const query = { disabled: { $ne: true } }
  if (bannerId) {
    query._id = bannerId
  }
  return query
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address } = req.body
    const { bannerId } = req.query
    const banner = await Banners.findOne(getBannerQuery(bannerId))
      .sort({ priority: -1 })
      .select('metadata')
    
    if (!banner) {
      res.status(404).end()
      return
    }

    const result = !!banner.metadata.find(item => item.address === address.toLowerCase())
    res.json({ result })
  } else {
    res.status(404).end()
  }
}
