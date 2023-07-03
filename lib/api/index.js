import { getToken } from 'next-auth/jwt'

export function listHandler({ collection, getQuery, getAggregator, maxPageSize = 20, sort = {}, select = '' }) {
  return async (req, res) => {
    const roles = (await getToken({ req }))?.roles
    const headerRoles = (req.headers?.['x-roles'] || '').split(',')

    const page = Number(req.query.page) || 0
    const size = Number(req.query.size) || 10
    if (page < 0 || page !== Math.floor(page)) {
      res.status(400).json({ error: { code: -32602, message: 'Invalid page value' } })
      return
    } else if (size < 1 || size !== Math.floor(size)) {
      res.status(400).json({ error: { code: -32602, message: 'Invalid size value' } })
      return
    } else if (size > maxPageSize) {
      res.status(400).json({ error: { code: -32602, message: `Size cannot exceed ${maxPageSize}` } })
      return
    }

    if (getQuery) {
      const query = await getQuery(req, roles, headerRoles)
      const total = await collection.count(query)
      const list = await collection.find(query)
        .sort(sort)
        .limit(size)
        .skip(size * page)
        .select(select)
        .exec()
      res.json({ result: { total, list } })
    } else {
      const aggregator = getAggregator(req, roles)
      aggregator.unshift({ $sort: sort })
      const counter = await collection.aggregate([...aggregator, { $group: { _id: null, total: { $sum: 1 } } }])
      const total = counter[0]?.total || 0
      const list = !total ? [] : await collection.aggregate([
        ...aggregator,
        { $project: Object.fromEntries(select.split(' ').map(key => [key, 1])) },
        { $skip: (size * page) },
        { $limit: size },
      ])
      res.json({ result: { total, list } })
    }
  }
}
