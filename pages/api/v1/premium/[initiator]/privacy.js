import { Premiums, Swaps } from 'lib/db'

export default async function handler(req, res) {
  const initiator = req.query.initiator.toLowerCase()
  if (req.method === 'PUT') {
    const result = await _updatePrivacy(initiator, req.body)
    res.json({ result })
  } else if (req.method === 'OPTIONS') {
    res.end()
  } else {
    res.status(404).send()
  }
}

async function _updatePrivacy(initiator, body) {
  if (typeof body.hideTxsOnExplorer === 'boolean') {
    await Premiums.update({ initiator, quota: { $gt: 0 } }, { hide: body.hideTxsOnExplorer }, { multi: true })
    await Swaps.update({ $or: [{ 'fromTo.0': initiator }, { initiator }] }, { hide: body.hideTxsOnExplorer }, { multi: true })
  }
}