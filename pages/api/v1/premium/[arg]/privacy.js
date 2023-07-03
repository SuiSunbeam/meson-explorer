import { PremiumAccounts, Swaps } from 'lib/db'

export default async function handler(req, res) {
  const premiumId = req.query.arg
  if (req.method === 'PUT') {
    const result = await _updatePrivacy(premiumId, req.body)
    res.json({ result })
  } else if (req.method === 'OPTIONS') {
    res.end()
  } else {
    res.status(404).send()
  }
}

async function _updatePrivacy(premiumId, body) {
  if (typeof body.hideTxsOnExplorer === 'boolean') {
    const premiumAccount = await PremiumAccounts.findByIdAndUpdate(premiumId, { 'params.hide': body.hideTxsOnExplorer }, { new: true })
    const fromAddressList = premiumAccount.address.map(addr => addr.split(':')[1])
    await Swaps.update({ 'fromTo.0': { $in: fromAddressList } }, { hide: body.hideTxsOnExplorer }, { multi: true })
  }
}