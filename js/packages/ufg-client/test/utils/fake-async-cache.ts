import {AsyncCache} from '../../types'

export type VerifyableAsynCache = AsyncCache & {
  getFetchCache: () => Map<string, any>
  getUploadCache: () => Map<string, any>
}

export const makeAsyncCache = (): VerifyableAsynCache => {
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
  const fetchCache = new Map<string, any>()
  const uploadCache = new Map<string, any>()
  return {
    getCachedResource: cacheFunc(fetchCache),
    isUploadedToUFG: cacheFunc(uploadCache),
    getFetchCache: () => fetchCache,
    getUploadCache: () => uploadCache,
  }

  function cacheFunc(cache: Map<string, any>) {
    return async (key: string, callback: () => Promise<unknown>) => {
      if (!cache.get(key)) {
        cache.set(
          key,
          wait(100).then(async () => {
            const result = await callback()
            cache.set(key, result)
            return result
          }),
        )
      }
      await wait(100)
      return cache.get(key)
    }
  }
}
