import fetch from 'node-fetch'

import { TESTNET } from 'lib/const'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await post(req, res)
  }
  res.status(404).send()
}

async function post(req, res) {
  const { service } = req.body
  const result = await restartService(service)
  if (result) {
    res.json({ result })
  } else {
    res.status(404).send()
  }
}

export async function restartService(service) {
  const prefix = TESTNET ? 'meson-testnet' : 'meson'
  let url
  if (service === 'lp') {
    url = `https://api.heroku.com/apps/${prefix}-lp/dynos`
  } else if (service === 'relayer') {
    url = `https://api.heroku.com/apps/${prefix}-relayer/dynos`
  } else {
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
  return await response.json()
}
