import MultiExtensionManager from '@mesonfi/extensions'
import { adaptors } from '@mesonfi/sdk'
import { AptosClient } from 'aptos'

import { presets } from 'lib/swap'

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
