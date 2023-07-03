import { Premiums, PremiumAccounts, PremiumRecords, Banners } from 'lib/db'
import { BigNumber } from 'ethers'
import TronWeb from 'tronweb'
import _ from 'lodash'

export default async function handler(req, res) {
  const addr = req.query.arg
  if (req.method === 'GET') {
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
    try {
      const result = await post(fromAddress)
      res.json({ result })
    } catch (e) {
      res.status(400).json({ error: { code: -32602, message: `Failed to claim premium: ${e.message}` } })
    }
  } else if (req.method === 'PUT') {
    try {
      const result = await _updatePremiumRoleClaim(fromAddress, req.body)
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

async function get(fromAddress, txs = false) {
  let addressList
  if (fromAddress.startsWith('T')) {
    addressList = [`tron:${address}`]
  } else if (fromAddress.length === 42) {
    addressList = [`ethers:${address}`]
  } else {
    addressList = [`aptos:${address}`, `sui:${address}`]
  }
  const acc = await PremiumAccounts.findOne({ address: { $in: addressList } })
  if (!acc) {
    return
  }
  const d = new Date()
  const query = { _id: { $gt: `${acc._id}:${d.valueOf() / 1000}`, $lt: `${acc._id}:~` } }
  const records = await PremiumRecords.find(query)
    .sort({ _id: 1 })
    .select('plan quota used saved since until' + (txs ? ' txs.hash' : ' -_id'))
  return { ...acc.toJSON(), records }
}

async function post(initiator) {
  const freePremium = await Banners.findOneAndUpdate({
    _id: 'free-premium',
    'metadata.address': initiator,
  }, { $set: { 'metadata.$[el].confirmed': true } }, { arrayFilters: [{ 'el.address': initiator }] })
  if (!freePremium) {
    throw new Error('Not eligible to claim Meson Premium')
  }

  console.log(freePremium)

  const premiums = await get(initiator)
  if (premiums?.length) {
    return premiums
  }
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  const until = since.valueOf() + 86400_000 * 30 - 1000
  const premium = await Premiums.create({
    _id: `${initiator}:${until / 1000}`,
    initiator,
    hash: initiator,
    used: 0,
    quota: 500000_000000,
    paid: Number(0),
    since,
    until: new Date(until),
    hide: false,
    meta: {},
  })
  
  
  return [_.omit(premium.toJSON(), ['_id', '__v', 'meta'])]
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

// export async function onPremiumPaid(data) {
//   let initiator
//   if (data.network.startsWith('tron')) {
//     initiator = TronWeb.address.toHex(data.from).replace('41', '0x')
//   } else {
//     initiator = data.from.toLowerCase()
//   }
//   const exists = await get(initiator, true)
//   const paid = BigNumber.from(data.erc20Value).add(10000)
//   let premium
//   if (exists?.length && paid.lt(10_000_000)) {
//     premium = await _addExtra(exists[0]._id, initiator, paid.mul(50000).toNumber(), data)
//   } else {
//     let since = new Date()
//     const lastPremium = exists?.[exists.length - 1]
//     const params = lastPremium?.params

//     if (lastPremium) {
//       since = new Date((lastPremium.until + 1) * 1000)
//     } else {
//       since.setUTCHours(0, 0, 0, 0)
//     }
//     premium = await _create(initiator, paid.mul(50000).toNumber(), since, lastPremium?.hide, params, data)

//     if (params) {
//       await fetch(`https://meson-bot.herokuapp.com/api/v1/claim-premium-role`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           initiator,
//           ...params
//         }),
//       })
//     }
//   }
//   return [_.omit(premium.toJSON(), ['_id', '__v', 'meta'])]
// }

// async function _create(initiator, quota, since, hide, params, { hash, erc20Value, ...tx }) {
//   const until = since.valueOf() + 86400_000 * 30 - 1000
//   return await Premiums.create({
//     _id: `${initiator}:${until / 1000}`,
//     initiator,
//     hash,
//     used: 0,
//     quota,
//     paid: Number(erc20Value),
//     since,
//     until: new Date(until),
//     hide,
//     meta: tx,
//     params
//   })
// }

// async function _addExtra(_id, initiator, quota, { hash, erc20Value, ...tx }) {
//   await Premiums.create({
//     _id: hash,
//     initiator,
//     hash,
//     paid: Number(erc20Value),
//     meta: tx
//   })
//   return await Premiums.findOneAndUpdate({ _id }, { $inc: { quota } }, { new: true })
// }
