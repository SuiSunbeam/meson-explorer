import { Banners } from 'lib/db'

function getBannerQuery (bannerId) {
  const query = { disabled: { $exists: false } }
  if (bannerId) {
    query._id = bannerId
  }
  return query
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const { bannerId, address = '' } = req.query
  const banner = await Banners.findOne(getBannerQuery(bannerId))
    .sort({ priority: -1 })
    .select('metadata')

  if (!banner) {
    res.json({ error: { code: 404, message: 'Not found' } })
  }

  if (banner.metadata.find(item => item.address === address.toLowerCase() )) {
    res.json({ result: { isValid: true } })
  } else {
    res.json({ result: { isValid: false } })
  }
}
