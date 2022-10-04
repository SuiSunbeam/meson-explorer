export function listHandler({ collection, getQuery, sort = {}, select = '' }) {
  return async (req, res) => {
    const page = Number(req.query.page) || 0
    const size = Number(req.query.size) || 10
    if (page < 0 || page !== Math.floor(page)) {
      res.status(400).json({ error: { code: -32602, message: 'Invalid page value' } })
      return
    } else if (size < 1 || size !== Math.floor(size)) {
      res.status(400).json({ error: { code: -32602, message: 'Invalid size value' } })
      return
    } else if (size > 20) {
      res.status(400).json({ error: { code: -32602, message: 'Size cannot exceed 20' } })
      return
    }
    
    const query = getQuery(req)
    const total = await collection.count(query)
    const list = await collection.find(query)
      .sort(sort)
      .limit(size)
      .skip(size * page)
      .exec()

    res.json({ result: { total, list } })
  }
}