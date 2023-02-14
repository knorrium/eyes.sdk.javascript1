import {type Transport} from '../transport'

export const transport: Transport<WebSocket> = {
  isReady(socket) {
    return socket.readyState === 1 // OPEN
  },
  onReady(socket, callback) {
    socket.addEventListener('open', callback)
    return () => socket.removeEventListener('open', callback)
  },
  onMessage(socket, callback) {
    const handler = (event: MessageEvent<string | Uint8Array>) => callback(event.data)
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
  send(socket, data: Uint8Array | string) {
    socket.send(data)
  },
}

export default transport
