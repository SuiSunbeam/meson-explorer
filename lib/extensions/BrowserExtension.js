export default class BrowserExtensions {
  constructor (type) {
    this._type = type
    this._accounts = []
    this._chainId = undefined
    this._currentAccount = undefined
    this._provider = null
  }

  get type () { return this._type }
  get chainId () { return this._chainId }
  get provider () { return this._provider }
  get currentAccount () { return this._currentAccount }
}
