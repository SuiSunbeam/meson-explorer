import fetch from 'node-fetch'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await post(req, res)
  }
  res.status(404).send()
}

async function post (req, res) {
  const { service } = req.body
  let url
  if (service === 'lp') {
    url = 'https://api.heroku.com/apps/meson-lp/dynos'
  } else if (service === 'relayer') {
    url = 'https://api.heroku.com/apps/meson-relayer/dynos'
  } else {
    res.status(404).send()
    return
  }
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.HEROKU_TOKEN}`,
      Accept: 'application/vnd.heroku+json; version=3'
    }
  })
  const result = await response.json()
  res.json({ result })
}
