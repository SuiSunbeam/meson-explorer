import io from 'socket.io-client'

class Socket {
  constructor(url) {
    this.socket = io(url, { autoConnect: false })
  }

  connect() {
    if (!this.socket.connected) {
      this.socket.connect()
    }
  }

  subscribe(swapId) {
    this.connect()
    this.socket.emit('subscribe', swapId)
  }

  unsubscribe(swapId) {
    if (this.socket.connected) {
      this.socket.emit('unsubscribe', swapId)
    }
  }

  onSwapUpdated(listener) {
    this.socket.on('swap-update', listener)
  }

  offSwapUpdated(listener) {
    this.socket.off('swap-update', listener)
  }
}

export default new Socket('http://localhost:3000')