import { SignedSwapRelease } from '@mesonfi/sdk'
import { utils } from 'ethers'
import tronWeb from 'tronweb'

import { BannersInAppDb } from 'lib/db'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return await put(req, res)
  }
  res.status(404).send()
}

async function put(req, res) {
  try {
    const result = await _onSwapRelease(req.body)
    res.json({ result })
  } catch (e) {
    res.status(400).json({ error: { code: -32602, message: `Failed to post release: ${e.message}` } })
  }
}

function getSwapId (encoded, initiator) {
  const packed = utils.solidityPack(['bytes32', 'address'], [encoded, initiator])
  return utils.keccak256(packed)
}

async function _onSwapRelease (data) {
  let release
  try {
    release = new SignedSwapRelease(data)
    release.checkSignature()
  } catch (e) {
    return
  }

  const swap = release.swap
  if (swap.salt.charAt(4) !== 'f') {
    return
  }

  const banner = await BannersInAppDb.findOne({ text: 'banner|cash-back' }).select('params disable')
  if (!banner || banner.disable) {
    return
  }

  const initiator = data.initiator.toLowerCase()
  const swapId = getSwapId(swap.encoded, initiator)
  const cashback = swap.amount.gt(1000_000000)
    ? 200_0000
    : swap.amount.div(5_000000).mul(10000).toNumber()

  let address
  if (banner.params.from) {
    address = initiator
    if (banner.params.networkId === 'tron') {
      address = tronWeb.address.fromHex(address)
    }
  } else {
    address = utils.isAddress(data.recipient) ? data.recipient.toLowerCase() : data.recipient
  }

  await BannersInAppDb.findOneAndUpdate(
    { text: 'banner|cash-back', 'meta.address': address },
    { $set: { 'meta.$[el].cashback': cashback, 'meta.$[el].swapId': swapId } },
    { arrayFilters: [{ 'el.address': address }] }
  ).exec()
}