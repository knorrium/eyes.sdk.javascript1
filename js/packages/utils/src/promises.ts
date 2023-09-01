import type {Awaitable, ControlledPromise} from './utility-types'

export function makeControlledPromise<T = void>(): ControlledPromise<T> {
  let promise: Promise<T>
  let resolve: (value: Awaitable<T>) => void
  let reject: (reason: any) => void
  let result: {status: 'fulfilled'; value: Awaitable<T>} | {status: 'rejected'; reason: any} | undefined

  function getPromise(): Promise<T> {
    if (!promise) {
      promise = new Promise<T>((...args) => ([resolve, reject] = args))
      if (result) {
        if (result.status === 'fulfilled') resolve(result.value)
        else reject(result.reason)
      }
    }
    return promise
  }

  return {
    then(onFulfilled, onRejected) {
      return getPromise().then(onFulfilled, onRejected)
    },
    catch(onRejected) {
      return getPromise().catch(onRejected)
    },
    finally(onFinally) {
      return getPromise().finally(onFinally)
    },
    get [Symbol.toStringTag]() {
      return 'ControlledPromise'
    },
    get settled() {
      return !!result
    },
    resolve(value: T) {
      if (resolve) resolve(value)
      else result ??= {status: 'fulfilled', value}
    },
    reject(reason) {
      if (reject) reject(reason)
      else result ??= {status: 'rejected', reason}
    },
  }
}
