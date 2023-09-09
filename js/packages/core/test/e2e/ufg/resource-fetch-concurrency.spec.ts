import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'
import {takeDomSnapshot} from '../../../src/ufg/utils/take-dom-snapshot'
import {makeDriver} from '@applitools/driver'
import {makeLogger} from '@applitools/logger'

describe('resource fetching with fetchConcurrency', () => {
  let page: spec.Driver, destroyPage: () => Promise<void>, server: any, baseUrl: string

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    let activeRequests = 0
    const maxRequests = 1

    const limitParallelRequests = async (_req: any, res: any, next: any) => {
      // If the maximum number of requests is exceeded, send a 503 error
      if (activeRequests >= maxRequests) {
        return res.status(503).send('Too many requests')
      }
      activeRequests++
      next()
      res.on('finish', () => {
        activeRequests--
      })
    }
    server = await makeTestServer({
      middlewares: [limitParallelRequests],
    })
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server?.close()
    // await closeApp()
    await destroyPage?.()
  })

  it('should limit a number of resources fetched in parallel', async () => {
    await page.goto(`${baseUrl}/fetch-concurrency/index.html`)
    const core = makeCore({spec, concurrency: 10, fetchConcurrency: 1})
    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'VgFetchConcurrency',
        testName: 'FetchConcurrency',
      },
    })
    await eyes.check({settings: {renderers: [{name: 'chrome', width: 800, height: 600}], disableBrowserFetching: true}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.isDifferent, false)
  })

  it('should limit a number of resources fetched in parallel with two eyes instances ', async () => {
    const driver = await makeDriver({driver: page, spec})
    await page.goto(`${baseUrl}/fetch-concurrency/index.html`)
    const snapshot1 = await takeDomSnapshot({
      context: driver.mainContext,
      logger: makeLogger(),
      settings: {disableBrowserFetching: true},
    })
    await page.goto(`${baseUrl}/fetch-concurrency/gargamel.html`)
    const snapshot2 = await takeDomSnapshot({
      context: driver.mainContext,
      logger: makeLogger(),
      settings: {disableBrowserFetching: true},
    })

    const checkPromise = []
    const core = makeCore({spec, concurrency: 10, fetchConcurrency: 1})
    const eyes1 = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'VgFetchConcurrency Eyes 1',
        testName: 'FetchConcurrency',
      },
    })
    const eyes2 = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'VgFetchConcurrency Eyes 2',
        testName: 'FetchConcurrency',
      },
    })
    checkPromise.push(
      eyes1.check({
        settings: {renderers: [{name: 'chrome', width: 800, height: 600}], disableBrowserFetching: true},
        target: {snapshot: snapshot1},
      }),
    )

    checkPromise.push(
      eyes2.check({
        settings: {renderers: [{name: 'chrome', width: 800, height: 600}], disableBrowserFetching: true},
        target: {snapshot: snapshot2},
      }),
    )

    await Promise.all(checkPromise)

    await eyes1.close({settings: {updateBaselineIfNew: false}})
    await eyes2.close({settings: {updateBaselineIfNew: false}})

    const [result1] = await eyes1.getResults()
    const [result2] = await eyes2.getResults()
    assert.strictEqual(result1.isDifferent, false)
    assert.strictEqual(result2.isDifferent, false)
  })
})
