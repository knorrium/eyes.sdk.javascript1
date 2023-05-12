import {makeLogger, type Logger} from '@applitools/logger'
import {type Transport} from './transport'
import * as transports from './transports'
import * as utils from '@applitools/utils'

export type WaitOptions = {timeout: number}

export interface Socket<TSocket = unknown> {
  readonly ready: boolean
  readonly target: TSocket
  use(socket: TSocket): void
  cleanup(): void
  emit(type: string | {name: string; key: string}, payload?: Record<string, any>): () => void
  on(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void
  once(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): () => void
  off(type: string | {name: string; key: string}, fn: (payload?: any, key?: string) => any): boolean
  request(name: string, payload?: any): Promise<any>
  command(name: string, fn: (payload?: any) => any): () => void
  wait(name: string, options?: WaitOptions): PromiseLike<void>
  wait<TResult>(name: string, fn: (payload?: any) => TResult, options?: WaitOptions): PromiseLike<TResult>
}

export interface SocketOptions<TTransport extends keyof typeof transports | Transport<unknown>> {
  transport: TTransport
  logger?: Logger
}

export function makeSocket<
  TTransport extends keyof typeof transports | Transport<unknown>,
  TSocket extends TTransport extends keyof typeof transports
    ? (typeof transports)[TTransport] extends Transport<infer USocket>
      ? USocket
      : never
    : TTransport extends Transport<infer USocket>
    ? USocket
    : never,
>(target: TSocket, options: SocketOptions<TTransport>): Socket<TSocket> {
  let ready = false
  const listeners = new Map<string, Set<(...args: any[]) => any>>()
  const queue = new Set<() => any>()
  const offs = new Set<() => any>()
  const transport: Transport<TSocket> = utils.types.isString(options.transport)
    ? (transports[options.transport as keyof typeof transports] as Transport<TSocket>)
    : options.transport
  const logger = makeLogger({logger: options.logger, format: {label: 'socket'}})

  use(target)

  return {
    get ready() {
      return ready
    },
    get target() {
      return target
    },
    use,
    cleanup,
    emit,
    on,
    once,
    off,
    request,
    command,
    wait,
  }

  function use(socket: TSocket) {
    cleanup()
    target = socket
    const offError = transport.onError(target, error => {
      const fns = listeners.get('error')
      if (fns) fns.forEach(fn => fn(error))
    })
    offs.add(offError)

    if (transport.isReady(target)) {
      attach()
    } else {
      const offReady = transport.onReady(target, () => {
        attach()
        const fns = listeners.get('ready')
        if (fns) fns.forEach(fn => fn())
      })
      offs.add(offReady)
    }

    function attach() {
      ready = true
      queue.forEach(command => command())
      queue.clear()

      const offMessage = transport.onMessage(target, message => {
        const {name, key, payload} = deserialize(message as string)
        logger.log(
          `Received event of type ${JSON.stringify({name, key})} with payload`,
          payload && JSON.stringify(payload, null, 4).slice(0, 5000),
        )
        const fns = listeners.get(name)
        if (fns) fns.forEach(fn => fn(payload, key))
        if (key) {
          const fns = listeners.get(`${name}/${key}`)
          if (fns) fns.forEach(fn => fn(payload, key))
        }
      })
      offs.add(offMessage)

      const offClose = transport.onClose(target, () => {
        const fns = listeners.get('close')
        if (fns) fns.forEach(fn => fn())
      })
      offs.add(offClose)
    }
  }

  function cleanup() {
    offs.forEach(off => off())
    offs.clear()
  }

  function emit(type: string | {name: string; key?: string}, payload?: Record<string, any>): () => void {
    const command = () => {
      logger.log(
        `Emit event of type ${JSON.stringify(type)} with payload`,
        payload && JSON.stringify(payload, null, 4).slice(0, 5000),
      )
      transport.send(target!, serialize(type, payload))
    }
    if (ready) command()
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
      once({name, key}, response => {
        if (response.error) {
          const error = new Error(response.error.message) as Error & {reason: string; info: Record<string, any>}
          error.reason = response.error.reason ?? 'unknown'
          error.info = response.error.info
          error.stack = response.error.stack
          return reject(error)
        }
        return resolve(response.result)
      })
      emit({name, key}, payload)
    })
  }

  function command(name: string, fn: (payload?: any) => any): () => void {
    return on(name, async (payload, key) => {
      try {
        const result = await fn(payload)
        emit({name, key}, {result})
      } catch (error: any) {
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

  function wait<TResult>(
    name: string,
    fnOrOptions?: ((payload?: any) => TResult) | WaitOptions,
    options?: WaitOptions,
  ): PromiseLike<TResult | void> {
    const result = utils.promises.makeControlledPromise<TResult>()
    let fn: (payload?: any) => TResult
    if (utils.types.isFunction(fnOrOptions)) fn = fnOrOptions
    else options = fnOrOptions

    const off = on(name, async payload => {
      try {
        result.resolve((await fn?.(payload)) as TResult)
      } catch (error: any) {
        result.reject(error)
      }
    })
    if (options?.timeout) {
      utils.general.sleep(options.timeout)!.then(() => {
        off()
        result.reject(new Error(`Event with name "${name}" wasn't emitted within ${options!.timeout}ms`))
      })
    }
    return {
      then: (onResolved, onRejected) => result.then(onResolved, onRejected),
    }
  }

  function serialize(type: string | {name: string; key?: string}, payload: any) {
    const message = utils.types.isString(type) ? {name: type, payload} : {name: type.name, key: type.key, payload}
    const data = JSON.stringify(message)
    return transport.format?.(data) ?? data
  }

  function deserialize(message: string) {
    return JSON.parse(message)
  }
}
