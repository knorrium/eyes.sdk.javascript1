import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {adjustUrlToDocker} from '../../utils/adjust-url-to-docker'
import {getTestInfo} from '@applitools/test-utils'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'
import {Renderer} from '@applitools/ufg-client'
import type * as BaseCore from '@applitools/core-base/types'

const batch = {id: `${Date.now()}`}

describe('custom properties per renderer', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let server: any, baseUrl: string

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    server = await makeTestServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server?.close()
    await destroyDriver?.()
  })

  it('sets custom properties per renderer', async () => {
    const pageUrl = adjustUrlToDocker(`${baseUrl}/page/index.html`)
    await driver.url(pageUrl)
    const core = makeCore({spec, concurrency: 10})

    const customProp = {name: 'prop-1', value: 'testing 123'}

    const openSettings = {
      serverUrl: 'https://eyesapi.applitools.com',
      apiKey: process.env.APPLITOOLS_API_KEY!,
      appName: 'core app',
      testName: 'sets custom properties per browser',
      properties: [customProp],
      batch,
    }

    const renderers: (Renderer & {properties?: BaseCore.CustomProperty[]})[] = [
      {
        width: 640,
        height: 480,
        name: 'chrome',
        properties: [
          {name: 'renderer', value: 'chrome'},
          {name: 'prop-1', value: 'duplicate so what 1'},
        ],
      },
      {
        width: 800,
        height: 600,
        name: 'firefox',
        properties: [
          {name: 'renderer', value: 'firefox'},
          {name: 'prop-1', value: 'duplicate so what 2'},
        ],
      },
      {
        chromeEmulationInfo: {deviceName: 'iPhone X'},
        properties: [
          {name: 'renderer', value: 'iPhone X'},
          {name: 'prop-1', value: 'duplicate so what 3'},
        ],
      },
    ]

    const checkPromise = core
      .openEyes({
        target: driver,
        settings: openSettings,
      })
      .then(async eyes => {
        await eyes.check({settings: {renderers}})
        await eyes.close({settings: {updateBaselineIfNew: false}})
        return eyes.getResults()
      })

    const checkAndClosePromise = core
      .openEyes({
        target: driver,
        settings: openSettings,
      })
      .then(async eyes => {
        await eyes.checkAndClose({settings: {renderers, updateBaselineIfNew: false}})
        return eyes.getResults()
      })

    const bothResults = await Promise.all([checkPromise, checkAndClosePromise])

    for (const results of bothResults) {
      for (const [index, result] of results.entries()) {
        const testData = await getTestInfo(result, process.env.APPLITOOLS_API_KEY)
        assert.deepStrictEqual(testData.startInfo.properties, [customProp, ...renderers[index].properties!])
      }
    }
  })
})
