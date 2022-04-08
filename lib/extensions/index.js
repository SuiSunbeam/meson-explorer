import TronWeb from 'tronweb'

import { presets } from '../swap'

import MetaMask from './MetaMask'

export class BrowserExtensions {
  constructor () {
    this.ext = null
  }

  _getExtentionClass (networkId) {
    const types = this._getExtensionTypes(networkId)
    switch (types[0]) {
      case 'metamask':
        return [MetaMask, window.ethereum, types[0]]
      // case 'tronlink':
      //   return [TronLink, window.tronLink, types[0]]
      default:
        throw new Error('Fail to connect to the browser extension. Invalid extension')
    }
  }

  _getExtensionTypes (networkId) {
    if (!networkId) {
      return ['metamask']
    }

    const network = presets.getNetwork(networkId)
    if (!network) {
      throw new Error('Invalid network')
    }
    if (!network.extensions?.length) {
      throw new Error('No supported extensions')
    }
    return network.extensions
  }

  get chainId () {
    return this.ext?.chainId
  }

  get shortCoinType () {
    return this.chainId && presets.getNetworkFromChainId(this.chainId)?.shortSlip44
  }

  get provider () { return this.ext.provider }

  getName (networkId) {
    const [Extension] = this._getExtentionClass(networkId)
    return Extension.Name
  }

  isExtensionInstalled (networkId) {
    return this._getExtentionClass(networkId)[1] !== undefined
  }

  async connect (networkId, onChange) {
    if (this.ext) {
      this.ext.dispose()
    }

    const [Extension, env, type] = this._getExtentionClass(networkId)
    this.ext = new Extension(env, type)

    const network = presets.getNetwork(networkId)
    await this.ext.enable(network, (chainId, account) => {
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
          error: 'Mismatch network'
        })
      } else if (this._getExtensionTypes(network.id).indexOf(this.ext.type) === -1) {
        onChange({
          networkId: network.id,
          currentAccount: account,
          accounts: [account],
          error: 'Mismatch network'
        })
      } else {
        onChange({
          networkId: network.id,
          currentAccount: account,
          accounts: [account],
          error: ''
        })
      }
    })
  }

  disconnect (onChange) {
    if (this.ext) {
      onChange()
      this.ext.dispose()
      this.ext = null
    }
  }

  async switch (networkId) {
    if (!this.ext) {
      return
    }
    if (this._getExtensionTypes(networkId).indexOf(this.ext.type) === -1) {
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

    const signer = this.provider.getSigner()
    const client = presets.getClient(networkId, signer)
    await client.mesonInstance.unlock(swap.encoded, initiator)
  }

  async withdraw (swap) {
    const networkId = await this._checkConnectedNetwork(swap.inChain)
    if (!networkId) {
      return
    }

    const signer = this.provider.getSigner()
    const client = presets.getClient(networkId, signer)
    await client.cancelSwap(swap.encoded)
  }

  async execute (swap, signature, recipient) {
    const networkId = await this._checkConnectedNetwork(swap.inChain)
    if (!networkId) {
      return
    }

    const signer = this.provider.getSigner()
    const client = presets.getClient(networkId, signer)
    if (swap.outChain === '0x00c3') {
      recipient = TronWeb.address.toHex(recipient).replace(/^41/, '0x')
    }
    await client.mesonInstance.executeSwap(swap.encoded, ...signature, recipient, true)
  }

  async release (swap, signature, initiator, recipient) {
    const networkId = await this._checkConnectedNetwork(swap.outChain)
    if (!networkId) {
      return
    }

    const signer = this.provider.getSigner()
    const client = presets.getClient(networkId, signer)
    await client.mesonInstance.release(swap.encoded, ...signature, initiator, recipient)
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
