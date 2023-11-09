import io from 'socket.io-client'
import { URL_SOCKET } from './const'

class Socket {
  constructor(url) {
    this.socket = io(url, { autoConnect: false, transports: ['websocket'] })
  }

  connect() {
    if (!this.socket.connected) {
      this.socket.connect()
    }
  }

  subscribe(swapId, listener) {
    this.connect()
    const wrappedListener = data => {
      if (data.swapId === swapId) {
        listener(data)
      }
    }
    this.socket.on('swap-update', wrappedListener)
    this.socket.emit('subscribe', swapId)
    return () => this.unsubscribe(swapId, wrappedListener)
  }

  unsubscribe(swapId, listener) {
    if (this.socket.connected) {
      this.socket.off('swap-update', listener)
      this.socket.emit('unsubscribe', swapId)
    }
  }
}

export default new Socket(URL_SOCKET)