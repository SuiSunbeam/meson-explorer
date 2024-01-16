import { Banners } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await get(req, res)
  }
  res.status(404).send()
}

async function get(req, res) {
  const { address = '' } = req.query
  const banner = await Banners.findById('bevm-odyssey').select('metadata')

  if (!banner) {
    res.status(404)
    return
  }

  const match = banner.metadata.find(item => item.address === address.toLowerCase() )
  if (match) {
    res.json({ uniqueId: match.swapId || match.address })
  } else {
    res.status(404)
  }
}
