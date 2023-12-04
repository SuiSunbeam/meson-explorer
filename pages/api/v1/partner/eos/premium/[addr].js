import fetch from 'node-fetch'

export default async function handler(req, res) {
  const { addr } = req.query
  if (req.method === 'GET') {
    const response = await fetch(`https://explorer.meson.fi/api/v1/premium/${addr}`)
    const { result } = await response.json()
    if (result?.records[0]) {
      const { fromAddress, quota, since, until } = result.records[0]
      const data = {
        fromAddress,
        quota: quota / 1e6,
        since: new Date(since * 1000),
        until: new Date(until * 1000),
      }
      res.json({ success: true, data })
    } else {
      res.json({ success: true, data: null })
    }
  } else if (req.method === 'POST') {
    const withFormat = `ethers:${addr.toLowerCase()}`
    const response = await fetch(`https://explorer.meson.fi/api/v1/premium/${withFormat}`, {
      method: 'POST'
    })
    const { result } = await response.json()
    if (result?.records[0]) {
      const { fromAddress, quota, since, until } = result.records[0]
      const data = {
        fromAddress,
        quota: quota / 1e6,
        since: new Date(since * 1000),
        until: new Date(until * 1000),
      }
      res.json({ success: true, data })
    } else {
      res.json({ success: false })
    }
  }
}
