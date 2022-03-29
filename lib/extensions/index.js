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
        // redux.dispatch('SET_FROM_NETWORK', network.id)
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
