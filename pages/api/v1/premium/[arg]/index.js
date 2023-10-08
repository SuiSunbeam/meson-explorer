import { PremiumAccounts, PremiumRecords, Banners } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Claim a premium lite
    try {
      const result = await post(req.query.arg)
      res.json({ result })
    } catch (e) {
      res.status(400).json({ error: { code: -32602, message: `Failed to claim premium: ${e.message}` } })
    }
    return
  }

  const addr = req.query.arg
  let addressWithFormat
  if (addr.startsWith('T')) {
    addressWithFormat = `tron:${addr}`
  } else if (addr.length === 42) {
    addressWithFormat = `ethers:${addr.toLowerCase()}`
  } else {
    addressWithFormat = { $in: [`aptos:${addr}`, `sui:${addr}`] }
  }

  if (req.method === 'GET') {
    const result = await getPremium(addressWithFormat)
    res.json({ result })
  } else if (req.method === 'PUT') {
    try {
      const result = await _updatePremiumRoleClaim(addressWithFormat, req.body)
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

async function post(_addressWithFormat) {
  let [format, address] = _addressWithFormat.split(':')
  if (format === 'ethers') {
    address = address.toLowerCase()
  }
  const addressWithFormat = `${format}:${address}`

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

  await Banners.findOneAndUpdate(
    { _id: 'claim-esd-lite', 'metadata.address': { $ne: address } },
    { $push: { metadata: { address } } }
  )

  // const freePremium = await Banners.findOneAndUpdate({
  //   _id: 'free-premium',
  //   'metadata.address': address,
  // }, { $set: { 'metadata.$[el].confirmed': true } }, { arrayFilters: [{ 'el.address': address }] })
  // if (!freePremium) {
  //   throw new Error('Not eligible to claim Meson Premium')
  // }

  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  const until = since.valueOf() + 7 * 86400_000 - 1000
  const record = await PremiumRecords.create({
    _id: `${premiumAccount._id}:${until / 1000}`,
    fromAddress: address,
    plan: 'premium-lite-2023-08-01',
    paid: Number(0),
    used: 0,
    quota: 21_000_000_000,
    since,
    until: new Date(until),
    txs: [],
  })
  premiumAccount.records.push(record)
  
  return premiumAccount
}

async function _updatePremiumRoleClaim(addressWithFormat, body) {
  // TODO: add the limit to invoke
  if (!body.discordId) {
    throw new Error('Update premium error')
  }

  const premiumAccount = await getPremium(addressWithFormat)
  if (!premiumAccount) {
    throw new Error('The address is not Meson Premium')
  }
  await PremiumAccounts.findByIdAndUpdate(premiumAccount._id, { params: { roleClaimed: body.claim, discordId: body.discordId } })

  return premiumAccount
}
