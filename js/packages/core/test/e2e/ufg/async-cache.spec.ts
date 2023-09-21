import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'
import {AsyncCache} from '@applitools/ufg-client'

// this is copy-paste from ufg-client
type VerifyableAsynCache = AsyncCache & {
  getFetchCache: () => Map<string, any>
  getUploadCache: () => Map<string, any>
}

const makeAsyncCache = (): VerifyableAsynCache => {
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
      assert.ok(key, 'cache key cannot be undefined')
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

describe('async cache', () => {
  let page: spec.Driver, destroyPage: () => Promise<void>

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyPage?.()
  })

  it('works with async cache', async () => {
    await page.goto(`https://applitools.github.io/demo/TestPages/FramesTestPage/`)

    const asyncCache = makeAsyncCache()

    const core = makeCore({spec, concurrency: 10, asyncCache})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'some app',
        testName: 'async cache',
      },
    })

    await eyes.check({settings: {fully: true}})

    await eyes.close()
    const results = await eyes.getResults()

    results.forEach(result => assert.strictEqual(result.status, 'Passed'))

    // example batch: https://eyes.applitools.com/app/test-results/00000251707178820181/?accountId=xIpd7EWjhU6cjJzDGrMcUw~~
  })
})
