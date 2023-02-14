import {type Transport} from '../transport'
import {type EventEmitter} from 'events'

export type Options = {
  events: {message: string; emit: string}
}

export function makeTransport(options: Options): Transport<EventEmitter> {
  return {
    isReady() {
      return true
    },
    onReady(socket, callback) {
      socket.on('ready', callback)
      return () => socket.off('ready', callback)
    },
    onMessage(socket, callback) {
      socket.on(options.events.message, callback)
      return () => socket.off(options.events.message, callback)
    },
    onClose(socket, callback) {
      socket.on('close', callback)
      return () => socket.off('close', callback)
    },
    onError(socket, callback) {
      socket.on('error', callback)
      return () => socket.off('error', callback)
    },
    send(socket, data) {
      socket.emit(options.events.emit, data)
    },
  }
}

export const transport = makeTransport({events: {message: 'incoming-message', emit: 'outgoing-message'}})

export default transport
