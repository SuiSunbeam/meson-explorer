import { providers } from 'ethers'
import BrowserExtension from './BrowserExtension'

export default class MetaMask extends BrowserExtension {
  static get Name () { return 'MetaMask' }

  constructor (ethereum, type) {
    super(type)
    if (ethereum && ethereum.isMetaMask) {
      this.ethereum = ethereum
      this._provider = new providers.Web3Provider(ethereum, 'any')
    } else {
      throw new Error('MetaMask is not installed. Please install it first.')
    }
  }

  async enable (network, onChanged = () => {}) {
    this.ethereum.on('accountsChanged', async accounts => {
      if (!accounts.length) {
        onChanged()
        return
      }
      this._chainId = await this.ethereum.request({ method: 'eth_chainId' })
      this._currentAccount = { address: accounts[0].toLowerCase(), hex: accounts[0].toLowerCase() }
      onChanged(this.chainId, this.currentAccount)
    })
    this.ethereum.on('chainChanged', chainId => {
      this._chainId = chainId
      onChanged(this.chainId, this.currentAccount)
    })

    try {
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' })
      this._currentAccount = { address: accounts[0].toLowerCase(), hex: accounts[0].toLowerCase() }
      this._chainId = await this.ethereum.request({ method: 'eth_chainId' })
      onChanged(this.chainId, this.currentAccount)
    } catch (e) {
      console.warn(e)
      if (
        e.message.indexOf('wallet_switchEthereumChain') > -1 ||
        e.message.indexOf('wallet_requestPermissions') > -1 ||
        e.message.indexOf('eth_requestAccounts') > -1
      ) {
        return
      }
      throw e
    }

    if (network && network.chainId !== this.chainId) {
      await this.switch(network)
    }
  }

  dispose () {
    this.ethereum.removeAllListeners('accountsChanged')
    this.ethereum.removeAllListeners('chainChanged')
  }

  async _getAllAccounts () {
    const result = await this.ethereum.request({ method: 'wallet_getPermissions' })
    const found = result[0].caveats.find(c => c.type === 'filterResponse')
    this._accounts = (found ? found.value : []).map(address => ({ address }))
    return this._accounts
  }

  async switch (network) {
    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      })
    } catch (error) {
      if (error.code === 4902) {
        await this.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: network.chainId,
              chainName: network.name,
              rpcUrls: [network.url],
              blockExplorerUrls: [network.explorer],
              nativeCurrency: network.nativeCurrency
            }
          ]
        })
      } else {
        throw error
      }
    }
  }

  async signMessage (message) {
    return await this.ethereum.request({ method: 'eth_sign', params: [this.currentAccount.address, message] })
  }

  async signTypedDataV1 (data) {
    return await this.ethereum.request({
      method: 'eth_signTypedData',
      params: [data, this.currentAccount.address]
    })
  }

  async signTypedDataV4 (data) {
    return await this.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [data, this.currentAccount.address],
      from: this.currentAccount.address
    })
  }

  async sendTransaction (tx) {
    return await this.ethereum.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
  }
}
