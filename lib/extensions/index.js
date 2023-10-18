import { utils } from 'ethers'
import MultiExtensionManager from '@mesonfi/extensions'
import { adaptors } from '@mesonfi/sdk'

import { RELAYERS } from 'lib/const'
import { presets, getSwapId } from 'lib/swap'

class ExtendedExtensionManager extends MultiExtensionManager {
  async bond (swap, signature, initiator) {
    const mesonClient = await this._getMesonClient(swap.inChain)
    await mesonClient?.postSwap({ encoded: swap.encoded, signature, initiator })
  }

  async lock (swap, signature, initiator) {
    const mesonClient = await this._getMesonClient(swap.outChain)
    await mesonClient?.lock({ encoded: swap.encoded, signature, initiator })
  }

  async unlock (swap, initiator) {
    const mesonClient = await this._getMesonClient(swap.outChain)
    await mesonClient?.unlock({ encoded: swap.encoded, initiator })
  }

  async withdraw (swap) {
    const mesonClient = await this._getMesonClient(swap.inChain)
    await mesonClient?.cancelSwap(swap.encoded)
  }

  async withdrawTo (swap, recipient) {
    const mesonClient = await this._getMesonClient(swap.inChain)
    const res = await fetch(`https://relayer.meson.fi/api/v1/swap/from-contract/${swap.encoded}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient })
    })
    const result = await res.json()
    const sig = utils.splitSignature(result.result)
    await mesonClient?.mesonInstance.cancelSwapTo(swap.encoded, recipient, sig.r, sig.yParityAndS)
  }

  async execute (swap, signature, recipient) {
    const mesonClient = await this._getMesonClient(swap.inChain)
    await mesonClient?.executeSwap({
      encoded: swap.encoded,
      signature,
      recipient
    }, true)
  }

  async release (swap, signature, initiator, recipient) {
    const mesonClient = await this._getMesonClient(swap.outChain)
    await mesonClient?.release({
      encoded: swap.encoded,
      signature,
      initiator,
      recipient
    })
  }

  async simpleRelease (swap, recipient) {
    const mesonClient = await this._getMesonClient(swap.outChain)
    await mesonClient?.mesonInstance.simpleRelease(swap.encoded, recipient)
  }

  async directRelease (swap, signature, initiator, recipient) {
    const mesonClient = await this._getMesonClient(swap.outChain)
    await mesonClient?.directRelease({
      encoded: swap.encoded,
      signature,
      initiator,
      recipient
    })
  }

  async manualWithdraw (swap, initiator, fromAddress) {
    const mesonClient = await this._getMesonClient(swap.inChain)
    await mesonClient?.ready()
    const tx = await mesonClient?.transferToken(swap.inToken, fromAddress, swap.amount)
    await fetch(`${RELAYERS[0]}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        swapId: getSwapId(swap.encoded, initiator),
        hash: tx.hash,
        event: 'CANCELLED'
      }),
    })
  }

  async transfer (swap, initiator, recipient) {
    const mesonClient = await this._getMesonClient(swap.outChain)
    await mesonClient?.ready()
    const tx = await mesonClient?.transferToken(swap.outToken, recipient, swap.receive)
    await fetch(`${RELAYERS[0]}/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        swapId: getSwapId(swap.encoded, initiator),
        hash: tx.hash,
        event: 'RELEASED'
      }),
    })
  }

  async _getMesonClient (chain) {
    const network = presets.getNetworkFromShortCoinType(chain)
    if (!network) {
      return
    }
    if (!this.currentExt) {
      await this.connect(network.id)
    } else {
      await this.switch(network.id)
    }
    let signer = this.extSigner
    if (network.id.startsWith('aptos')) {
      const client = this._mesonPresets.createNetworkClient(network.id, [network.url])
      signer = adaptors.aptos.getWalletFromExtension(this.currentExt, client)
    } else if (network.id.startsWith('sui')) {
      const client = this._mesonPresets.createNetworkClient(network.id, [network.url])
      signer = adaptors.sui.getWalletFromExtension(this.currentExt, client)
    }
    return presets.createMesonClient(network.id, signer)
  }
}

const extensions = new ExtendedExtensionManager(global.window, presets)

export default extensions
