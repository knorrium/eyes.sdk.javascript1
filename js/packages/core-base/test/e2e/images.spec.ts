import {readFileSync} from 'fs'
import {makeCore, type Core} from '../../src/index'
import assert from 'assert'
import {getTestInfo, getTestDom} from '@applitools/test-utils'
import {testServer} from '@applitools/test-server'

describe('images', () => {
  let core: Core

  before(() => {
    core = makeCore({agentId: 'core-base/test'})
  })

  it('works with png image input', async () => {
    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        appName: 'Test App',
        testName: 'Test',
        environment: {
          os: 'Platform',
          hostingApp: 'TestBrowser',
          deviceName: 'Machine',
          viewportSize: {width: 210, height: 700},
        },
      },
    })

    await eyes.check({
      target: {
        image: readFileSync('./test/fixtures/screenshot.png'),
      },
    })

    await eyes.close()
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })

  it('works with jpeg image input', async () => {
    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        appName: 'Test App',
        testName: 'Test',
        environment: {
          os: 'Platform',
          hostingApp: 'TestBrowser',
          deviceName: 'Machine',
          viewportSize: {width: 210, height: 700},
        },
      },
    })

    await eyes.check({
      target: {
        image: readFileSync('./test/fixtures/screenshot.jpeg'),
      },
    })

    await eyes.close()
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })

  it('works with bmp image input', async () => {
    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        appName: 'Test App',
        testName: 'Test',
        environment: {
          os: 'Platform',
          hostingApp: 'TestBrowser',
          deviceName: 'Machine',
          viewportSize: {width: 210, height: 700},
        },
      },
    })

    await eyes.check({
      target: {
        image: readFileSync('./test/fixtures/screenshot.bmp'),
      },
    })

    await eyes.close()
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })

  it('works with densityMetrics in setting', async () => {
    // two-step for that test
    // I. open eyes with densityMetrics that represent the **right size** of the image in xdpi and ydpi
    // -- expect that accessibilityStatus.status will be **'Failed'** because only the title is marked as large text.
    // II. open eyes with densityMetrics that represent a **less of the size** of the image in xdpi and ydpi
    // -- expect that accessibilityStatus.status will be **'Passed'** because all the texts mark as large text.
    const image = readFileSync('./test/fixtures/accessibility-test.png')
    const environment = {
      os: 'Platform',
      hostingApp: 'TestBrowser',
      deviceName: 'Machine',
      viewportSize: {width: 2125, height: 2750},
    }

    const eyesStep1 = await core.openEyes({
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        appName: 'Test App',
        testName: 'Passing accessibility',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        environment,
      },
    })

    await eyesStep1.check({
      target: {
        image,
      },
      settings: {
        densityMetrics: {
          xdpi: 2125,
          ydpi: 2750,
          scaleRatio: 1,
        },
        accessibilitySettings: {
          level: 'AA',
          version: 'WCAG_2_0',
        },
      },
    })

    await eyesStep1.close()
    const [result_step_1] = await eyesStep1.getResults()
    assert.strictEqual(result_step_1.accessibilityStatus?.status, 'Failed')

    const eyesStep2 = await core.openEyes({
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        appName: 'Test App',
        testName: 'Failing accessibility',
        apiKey: process.env.APPLITOOLS_API_KEY as string,
        environment,
      },
    })

    await eyesStep2.check({
      target: {
        image,
      },
      settings: {
        densityMetrics: {
          xdpi: 10,
          ydpi: 10,
          scaleRatio: 1,
        },
        accessibilitySettings: {
          level: 'AA',
          version: 'WCAG_2_0',
        },
      },
    })

    await eyesStep2.close()
    const [result_step_2] = await eyesStep2.getResults()
    assert.strictEqual(result_step_2.accessibilityStatus?.status, 'Passed')
  })

  describe('domMapping', () => {
    let destroyServer: () => Promise<void>, baseUrl: string
    before(async () => {
      const server = await testServer()
      destroyServer = () => server.close()
      baseUrl = `http://localhost:${server.port}`
    })
    after(async () => {
      await destroyServer?.()
    })

    it('works with domMapping', async () => {
      const eyes = await core.openEyes({
        settings: {
          eyesServerUrl: process.env.APPLITOOLS_SERVER_URL ?? 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY as string,
          appName: 'Test App',
          testName: 'Test DOM mapping',
          environment: {
            os: 'Platform',
            hostingApp: 'TestBrowser',
            deviceName: 'Machine',
            viewportSize: {width: 210, height: 700},
          },
        },
      })

      await eyes.check({
        target: {
          image: readFileSync('./test/fixtures/screenshot.png'),
        },
        settings: {
          domMapping: './test/fixtures/dom-mapping.json',
        },
      })

      await eyes.check({
        target: {
          image: readFileSync('./test/fixtures/screenshot.png'),
        },
        settings: {
          domMapping: `${baseUrl}/dom-mapping.json`,
        },
      })

      await eyes.check({
        target: {
          image: readFileSync('./test/fixtures/screenshot.png'),
        },
        settings: {
          domMapping: readFileSync('./test/fixtures/dom-mapping.json'),
        },
      })

      await eyes.close()
      const [result] = await eyes.getResults()

      const info = await getTestInfo(result)
      const expectedDomMapping = JSON.parse(readFileSync('./test/fixtures/dom-mapping.json').toString())

      for (const actualAppOutput of info.actualAppOutput) {
        assert.deepStrictEqual(await getTestDom(result, actualAppOutput.image.domMappingId, false), expectedDomMapping)
      }
    })
  })
})
