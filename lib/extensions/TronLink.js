import BrowserExtension from './BrowserExtension'

export default class TronLink extends BrowserExtension {
  static get Name () { return 'TronLink' }

  constructor (tronLink, type) {
    super(type)
    if (tronLink) {
      this.tronLink = tronLink
      this.tronWeb = tronLink.tronWeb
    } else {
      throw new Error('TronLink is not installed. Please install it first.')
    }

    this.onChanged = () => {}

    this.tronlinkListener = this._onTronlinkEvent.bind(this)
    window.addEventListener('message', this.tronlinkListener)
  }

  get signer () {
    return this.tronWeb
  }

  async enable (onChanged = () => {}) {
    await this.tronLink.request({ method: 'tron_requestAccounts' })

    const defaultAddress = this.tronWeb.defaultAddress

    const host = this.tronWeb.fullNode.host
    if (host === 'https://api.trongrid.io' || host === 'https://api.tronstack.io') {
      this._chainId = 'tron'
    } else {
      this._chainId = 'tron-testnet'
    }
    this._currentAccount = { address: defaultAddress.base58, hex: `0x${defaultAddress.hex.substring(2)}` }
    this.onChanged = onChanged
    onChanged(this._chainId, this._currentAccount)
  }

  _onTronlinkEvent (e) {
    const message = e.data.message
    if (!message) {
      return
    }

    switch (message.action) {
      case 'tabReply':
        // console.log('tabReply event', message)
        break
      case 'connect':
        console.log('connect event', message.isTronLink)
        break
      case 'disconnect':
        console.log('disconnect event', message.isTronLink)
        break
      case 'accountsChanged': {
        const defaultAddress = this.tronWeb.defaultAddress
        this._currentAccount = { address: defaultAddress.base58, hex: `0x${defaultAddress.hex.substring(2)}` }
        this.onChanged(this._chainId, this._currentAccount)
        break
      }
      case 'setNode': {
        const host = this.tronWeb.fullNode.host
        if (host === 'https://api.trongrid.io' || host === 'https://api.tronstack.io') {
          this._chainId = 'tron'
        } else {
          this._chainId = 'tron-testnet'
        }
        this.onChanged(this._chainId, this._currentAccount)
        break
      }
      default:
    }
  }

  dispose () {
    window.removeEventListener('message', this.tronlinkListener)
  }

  async _getAllAccounts () {
    return []
  }

  async switch (network) {
  }

  async signMessage (message) {
    return await this.tronWeb.trx.sign(message)
  }

  async signTypedDataV1 (data) {
    throw new Error('Not implemented')
  }

  async signTypedDataV4 (data) {
    throw new Error('Not implemented')
  }

  async sendTransaction (tx) {
    const { abi, address } = tx.contract
    const instance = this.tronWeb.contract(abi, address)
    await instance.methods[tx.method](...tx.args).send({ shouldPollResponse: true })
  }
}
