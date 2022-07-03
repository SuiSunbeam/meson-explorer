import { presets } from 'lib/swap'

import MetaMask from './MetaMask'
import TronLink from './TronLink'

export class BrowserExtensions {
  constructor () {
    this.ext = null
  }

  _getExtentionClassFromNetworkId (networkId) {
    const types = this._getExtensionTypes(networkId)
    return this._getExtentionClass(types[0])
  }

  _getExtensionTypes (networkId) {
    const network = presets.getNetwork(networkId)
    if (!network) {
      throw new Error('Invalid network')
    }
    if (!network.extensions?.length) {
      throw new Error('No supported extensions')
    }
    return network.extensions
  }

  _getExtentionClass (extType) {
    switch (extType) {
      case 'metamask':
        return [MetaMask, window.ethereum, extType]
      case 'tronlink':
        return [TronLink, window.tronLink, extType]
      default:
        return []
    }
  }

  get chainId () {
    return this.ext?.chainId
  }

  get shortCoinType () {
    return this.chainId && presets.getNetworkFromChainId(this.chainId)?.shortSlip44
  }

  get provider () { return this.ext.provider }

  getName (extType) {
    const [Extension] = this._getExtentionClass(extType)
    return Extension?.Name || ''
  }

  isExtensionInstalled (extType) {
    return !this._getExtentionClass(extType)[1]
  }

  async connect (extType, onChange) {
    this.disconnect()

    const [Extension, env, type] = this._getExtentionClass(extType)
    if (!Extension) {
      throw new Error('Fail to connect to the browser extension. Invalid extension')
    }

    this.ext = new Extension(env, type)

    await this.ext.enable((chainId, account) => {
      if (!chainId) {
        this.disconnect()
        return
      }
      const network = presets.getNetworkFromChainId(chainId)

      if (!network) {
        onChange({
          networkId: `unknown:${chainId}`,
          currentAccount: account,
          accounts: [account],
        })
      } else if (this._getExtensionTypes(network.id).indexOf(this.ext.type) === -1) {
        onChange({
          networkId: network.id,
          currentAccount: account,
          accounts: [account],
        })
      } else {
        onChange({
          networkId: network.id,
          currentAccount: account,
          accounts: [account],
        })
      }
    })
  }

  disconnect () {
    if (this.ext) {
      this.ext.dispose()
      this.ext = null
    }
  }

  async switch (networkId) {
    if (!this.ext) {
      return
    }
    if (this._getExtentionClassFromNetworkId(networkId).indexOf(this.ext.type) === -1) {
      this.disconnect()
    } else {
      const network = presets.getNetwork(networkId)
      await this.ext.switch(network)
    }
  }

  getAddress () {
    return this.ext.currentAccount?.hex
  }

  async unlock (swap, initiator) {
    const networkId = await this._checkConnectedNetwork(swap.outChain)
    if (!networkId) {
      return
    }

    const client = presets.getClient(networkId, this.ext.signer)
    await client.unlock({ encoded: swap.encoded, initiator })
  }

  async withdraw (swap) {
    const networkId = await this._checkConnectedNetwork(swap.inChain)
    if (!networkId) {
      return
    }

    const client = presets.getClient(networkId, this.ext.signer)
    await client.cancelSwap(swap.encoded)
  }

  async execute (swap, signature, recipient) {
    const networkId = await this._checkConnectedNetwork(swap.inChain)
    if (!networkId) {
      return
    }

    const client = presets.getClient(networkId, this.ext.signer)
    await client.executeSwap({
      encoded: swap.encoded, 
      signature,
      recipient
    }, true)
  }

  async release (swap, signature, initiator, recipient) {
    const networkId = await this._checkConnectedNetwork(swap.outChain)
    if (!networkId) {
      return
    }

    const client = presets.getClient(networkId, this.ext.signer)
    await client.release({
      encoded: swap.encoded,
      signature,
      initiator,
      recipient
    })
  }

  async _checkConnectedNetwork (chain) {
    const network = presets.getNetworkFromShortCoinType(chain)
    if (!network) {
      return
    }
    await this.switch(network.id)
    return network.id
  }

  async signMessage (msg) {
    return await this.ext.signMessage(msg)
  }

  async signTypedData (data) {
    return await this.ext.signTypedDataV1(data)
  }

  async sendTransaction (tx) {
    return await this.ext.sendTransaction(tx)
  }
}

export default new BrowserExtensions()
