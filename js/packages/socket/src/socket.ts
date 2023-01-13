import {type Logger} from '@applitools/logger'
import {type Transport} from './transport'
import * as transports from './transports'
import * as utils from '@applitools/utils'

export interface Socket<TConnectOptions = never> {
  connect(options: TConnectOptions): void
  destroy(): void
  emit(type: string | {name: string; key: string}, payload?: Record<string, any>): () => void
  on(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void
  once(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void
  off(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): boolean
  request(name: string, payload?: any): Promise<any>
  command(name: string, fn: (payload?: any) => any): () => void
  create<TResult>(name: string, fn: (payload?: any) => TResult): PromiseLike<TResult>
  ref(): () => void
  unref(): () => void
}

export interface SocketOptions<TTransport extends keyof typeof transports | Transport<unknown, unknown>> {
  transport: TTransport
  logger?: Logger
}

export function makeSocket<
  TTransport extends keyof typeof transports | Transport<unknown, unknown>,
  TSocket extends TTransport extends keyof typeof transports
    ? (typeof transports)[TTransport] extends Transport<infer USocket, unknown>
      ? USocket
      : never
    : TTransport extends Transport<infer USocket, unknown>
    ? USocket
    : never,
  TConnectOptions extends TTransport extends keyof typeof transports
    ? (typeof transports)[TTransport] extends Transport<unknown, infer UConnectOptions>
      ? UConnectOptions
      : never
    : TTransport extends Transport<unknown, infer UConnectOptions>
    ? UConnectOptions
    : never,
>(socket: TSocket | null, options: SocketOptions<TTransport>): Socket<TConnectOptions> {
  const listeners = new Map<string, Set<(...args: any[]) => any>>()
  const queue = new Set<() => any>()
  const transport: Transport<TSocket, unknown> = utils.types.isString(options.transport)
    ? (transports[options.transport as keyof typeof transports] as Transport<TSocket, unknown>)
    : (options.transport as Transport<TSocket, unknown>)
  const logger = options.logger

  if (socket) attach(socket)

  return {
    connect,
    destroy,
    emit,
    on,
    once,
    off,
    request,
    command,
    create,
    ref,
    unref,
  }

  function attach(sock: TSocket) {
    if (!sock) return

    transport.onError(sock, error => {
      const fns = listeners.get('error')
      if (fns) fns.forEach(fn => fn(error))
    })

    const attach = () => {
      socket = sock
      queue.forEach(command => command())
      queue.clear()

      transport.onMessage(socket, message => {
        const {name, key, payload} = deserialize(message as string)
        const fns = listeners.get(name)
        if (fns) fns.forEach(fn => fn(payload, key))
        if (key) {
          const fns = listeners.get(`${name}/${key}`)
          if (fns) fns.forEach(fn => fn(payload, key))
        }
      })

      transport.onClose(socket, () => {
        const fns = listeners.get('close')
        if (fns) fns.forEach(fn => fn())
      })
    }

    if (transport.isReady(sock)) attach()
    else transport.onReady(sock, () => attach())
  }

  function connect(options: TConnectOptions) {
    if (transport.connect) attach(transport.connect(options))
  }

  function destroy() {
    if (!socket) return
    if (transport.destroy) transport.destroy(socket)
    socket = null
  }

  function emit(type: string | {name: string; key?: string}, payload?: Record<string, any>): () => void {
    const command = () => transport.send(socket!, serialize(type, payload))
    if (socket) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  function on(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    let fns = listeners.get(name)
    if (!fns) {
      fns = new Set()
      listeners.set(name, fns)
    }
    fns.add(fn)
    return () => off(name, fn)
  }

  function once(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void {
    const off = on(type, (...args) => (fn(...args), off()))
    return off
  }

  function off(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): boolean {
    const name = utils.types.isString(type) ? type : `${type.name}/${type.key}`
    if (!fn) return listeners.delete(name)
    const fns = listeners.get(name)
    if (!fns) return false
    const existed = fns.delete(fn)
    if (!fns.size) listeners.delete(name)
    return existed
  }

  function request(name: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const key = utils.general.guid()
      emit({name, key}, payload)
      once({name, key}, response => {
        if (response.error) {
          const error = new Error(response.error.message)
          error.stack = response.error.stack
          return reject(error)
        }
        return resolve(response.result)
      })
    })
  }

  function command(name: string, fn: (payload?: any) => any): () => void {
    return on(name, async (payload, key) => {
      logger?.log('[COMMAND]', name, JSON.stringify(payload, null, 4))
      try {
        const result = await fn(payload)
        logger?.log(
          `[COMMAND] ${name} finished successfully with result`,
          result && JSON.stringify(result, null, 4).slice(0, 3000),
        )
        emit({name, key}, {result})
      } catch (error: any) {
        logger?.log(`[COMMAND] ${name} failed with an error`, error)
        emit(
          {name, key},
          {
            error: {
              message: error.message,
              stack: error.stack,
              reason: error.reason ?? 'internal',
              ...error.toJSON?.(),
            },
          },
        )
      }
    })
  }

  function create<TResult>(name: string, fn: (payload?: any) => TResult): PromiseLike<TResult> {
    let temporary = utils.promises.makeControlledPromise<TResult>()
    let result = temporary
    on(name, async payload => {
      result = temporary
      try {
        result.resolve(await fn(payload))
      } catch (error: any) {
        result.reject(error)
      } finally {
        temporary = utils.promises.makeControlledPromise<TResult>()
      }
    })
    return {
      then: (onResolved, onRejected) => result.then(onResolved, onRejected),
    }
  }

  function ref() {
    if (!transport.ref) return () => undefined
    const command = () => transport.ref!(socket!)
    if (socket) command()
    else queue.add(command)
    return () => queue.delete(command)
  }

  function unref() {
    if (!transport.unref) return () => undefined
    const command = () => transport.unref!(socket!)
    if (socket) command()
    else queue.add(command)
    return () => queue.delete(command)
  }
}

function serialize(type: string | {name: string; key?: string}, payload: any) {
  const message = utils.types.isString(type) ? {name: type, payload} : {name: type.name, key: type.key, payload}
  return JSON.stringify(message)
}

function deserialize(message: string) {
  return JSON.parse(message)
}
