import {type Transport} from '../transport'
import {createConnection, type Socket, type IpcSocketConnectOpts} from 'net'

export const transport: Transport<Socket, IpcSocketConnectOpts> = {
  isReady(socket): boolean {
    return !(socket as any).pending
  },
  onReady(socket, callback: () => void): void {
    socket.on('ready', callback)
  },
  onMessage(socket, callback) {
    socket.on('data', callback)
  },
  onClose(socket, callback) {
    socket.on('close', callback)
  },
  onError(socket, callback) {
    socket.on('error', callback)
  },
  connect(options) {
    return createConnection(options)
  },
  send(socket, data: Buffer | string) {
    socket.write(data)
  },
  destroy(socket) {
    socket.destroy()
  },
  ref(socket) {
    socket.ref()
  },
  unref(socket) {
    socket.unref()
  },
}

export default transport
