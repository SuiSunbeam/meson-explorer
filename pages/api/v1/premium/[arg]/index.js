import { Premiums, PremiumAccounts, PremiumRecords, Banners } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const addr = req.query.arg
    let addressList
    if (addr.startsWith('T')) {
      addressList = [`tron:${addr}`]
    } else if (addr.length === 42) {
      addressList = [`ethers:${addr.toLowerCase()}`]
    } else {
      addressList = [`aptos:${addr}`, `sui:${addr}`]
    }
    const result = await PremiumAccounts.findOne({ address: { $in: addressList } })
    res.json({ result })
  } else if (req.method === 'POST') {
    // Claim a premium lite
    try {
      const result = await post(req.query.arg)
      res.json({ result })
    } catch (e) {
      res.status(400).json({ error: { code: -32602, message: `Failed to claim premium: ${e.message}` } })
    }
  } else if (req.method === 'PUT') {
    try {
      const result = await _updatePremiumRoleClaim(addr, req.body)
      res.json({ result })
    } catch (e) {
      res.status(400).json({ error: { code: -32602, message: `Failed to update premium: ${e.message}` } })
    }
  } else if (req.method === 'OPTIONS') {
    res.end()
  } else {
    res.status(404).send()
  }
}

async function getPremium(addressWithFormat, txs = false) {
  const acc = await PremiumAccounts.findOne({ address: addressWithFormat })
  if (!acc) {
    return
  }
  const d = new Date()
  const query = { _id: { $gt: `${acc._id}:${d.valueOf() / 1000}`, $lt: `${acc._id}:~` } }
  const records = await PremiumRecords.find(query).sort({ _id: 1 })
    .select('plan quota used saved since until' + (txs ? ' txs.hash' : ' -_id'))
  return { ...acc.toJSON(), records }
}

async function post(addressWithFormat) {
  const [format, address] = addressWithFormat.split(':')

  const freePremium = await Banners.findOneAndUpdate({
    _id: 'free-premium',
    'metadata.address': address,
  }, { $set: { 'metadata.$[el].confirmed': true } }, { arrayFilters: [{ 'el.address': address }] })
  if (!freePremium) {
    throw new Error('Not eligible to claim Meson Premium')
  }

  let premiumAccount = await getPremium(addressWithFormat)
  if (!premiumAccount) {
    const acc = await PremiumAccounts.create({
      _id: addressWithFormat,
      address: [addressWithFormat],
      params: {}
    })
    premiumAccount = { ...acc.toJSON(), records: [] }
  }

  if (premiumAccount.records.length) {
    return premiumAccount
  }

  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  const until = since.valueOf() + 30 * 86400_000 - 1000
  const record = await PremiumRecords.create({
    _id: `${premiumAccount._id}:${until / 1000}`,
    fromAddress: address,
    plan: 'premium-lite-0',
    paid: Number(0),
    used: 0,
    quota: 100_000_000_000,
    since,
    until: new Date(until),
    txs: [],
  })
  premiumAccount.records.push(record)
  
  return premiumAccount
}

async function _updatePremiumRoleClaim(initiator, body) {
  // TODO: add the limit to invoke
  if (!body.discordId) {
    throw new Error('Update premium error')
  }

  const premiums = await get(initiator)
  if (!premiums?.length) {
    throw new Error('The address is not Meson Premium')
  }

  return await Premiums.findOneAndUpdate({ initiator }, { params: { roleClaimed: body.claim, discordId: body.discordId } }, { sort: { since: -1 } })
}
