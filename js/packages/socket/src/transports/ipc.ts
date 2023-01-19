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
    socket.on('data', data => splitMessages(data).forEach(data => callback(data)))
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
  send(socket, data: Uint8Array | string) {
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
  format(data: Uint8Array | string) {
    const header = Buffer.allocUnsafe(4)
    const buffer = Buffer.from(data)
    header.writeUint32BE(buffer.byteLength)
    const format = Buffer.concat([header, buffer])
    return format
  },
}

function splitMessages(data: Uint8Array | string): Uint8Array[] {
  const buffer = Buffer.from(data)
  const messages = [] as Uint8Array[]
  let offset = 0
  while (offset < buffer.length) {
    const messageLength = buffer.readUInt32BE(offset)
    offset += 4
    messages.push(buffer.slice(offset, offset + messageLength))
    offset += messageLength
  }
  return messages
}

export default transport
