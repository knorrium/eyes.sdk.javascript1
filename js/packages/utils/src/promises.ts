export function makeControlledPromise<T = void>(): PromiseLike<T> & {
  resolve(value: T): void
  reject(reason?: any): void
} {
  let promise: Promise<T>
  let resolve: (value: T) => void
  let reject: (reason: any) => void
  let result: {status: 'fulfilled'; value: T} | {status: 'rejected'; reason: any}
  return {
    then(onFulfilled, onRejected) {
      if (!promise) {
        promise = new Promise<T>((...args) => ([resolve, reject] = args))
        if (result?.status === 'fulfilled') resolve(result.value)
        else if (result?.status === 'rejected') reject(result.reason)
      }
      return promise.then(onFulfilled, onRejected)
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
