import {type Transport} from '../transport'
import * as utils from '@applitools/utils'

export type Data = string | Uint8Array

export const transport: Transport<WebSocket, Data> = {
  isReady(socket) {
    return socket.readyState === 1 // OPEN
  },
  onReady(socket, callback) {
    socket.addEventListener('open', callback)
    return () => socket.removeEventListener('open', callback)
  },
  onMessage(socket, callback) {
    const handler = (event: MessageEvent<Data>) => callback(event.data)
    socket.addEventListener('message', handler)
    return () => socket.removeEventListener('message', handler)
  },
  onClose(socket, callback) {
    socket.addEventListener('close', () => callback())
    return () => socket.removeEventListener('close', callback)
  },
  onError(socket, callback) {
    const handler = (event: Event) => callback((event as any).error)
    socket.addEventListener('error', handler)
    return () => socket.removeEventListener('error', handler)
  },
  send(socket, data) {
    socket.send(data)
  },
  serialize(data) {
    return JSON.stringify(data)
  },
  deserialize(data) {
    return JSON.parse(utils.types.isString(data) ? data : new TextDecoder().decode(data))
  },
}

export default transport
