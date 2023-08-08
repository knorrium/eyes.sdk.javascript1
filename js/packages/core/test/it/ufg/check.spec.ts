import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import {MockDriver, spec} from '@applitools/driver/fake'
import assert from 'assert'

describe('check', () => {
  it('renders multiple viewport sizes', async () => {
    const core = makeCore({base: makeFakeCore(), clients: {ufg: makeFakeClient()}, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        name: 'good',
        renderers: [
          {width: 320, height: 480},
          {width: 640, height: 768},
          {width: 1600, height: 900},
        ],
      },
    })

    await eyes.close()
    const results = await eyes.getResults()

    assert.deepStrictEqual(
      results.map(result => result.stepsInfo!.map((step: any) => step.asExpected)),
      [[true], [true], [true]],
    )
  })

  it('renders with correct renderer', async () => {
    const core = makeCore({base: makeFakeCore(), clients: {ufg: makeFakeClient()}, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        name: 'good',
        region: {x: 3, y: 4, width: 1, height: 2},
        renderers: [{name: 'firefox', width: 100, height: 100}],
      },
    })

    await eyes.close()
    const results = await eyes.getResults()

    assert.deepStrictEqual(
      results.map(result => result.renderer),
      [{name: 'firefox', width: 100, height: 100}],
    )
  })

  it('handles region by selector', async () => {
    const core = makeCore({base: makeFakeCore(), clients: {ufg: makeFakeClient()}, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    await eyes.check({
      target: {cdt: []},
      settings: {name: 'good', region: 'sel1', renderers: [{width: 100, height: 100}]},
    })

    await eyes.close()
    const results = await eyes.getResults()

    assert.deepStrictEqual(
      results.map(result =>
        result.stepsInfo!.map((step: any) => ({
          asExpected: step.asExpected,
          locationInViewport: step.target.locationInViewport,
        })),
      ),
      [[{asExpected: true, locationInViewport: {x: 1, y: 2}}]],
    )
  })

  it('handles region by coordinates', async () => {
    const core = makeCore({base: makeFakeCore(), clients: {ufg: makeFakeClient()}, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        name: 'good',
        region: {x: 3, y: 4, width: 1, height: 2},
        renderers: [{width: 100, height: 100}],
      },
    })

    await eyes.close()
    const results = await eyes.getResults()

    assert.deepStrictEqual(
      results.map(result =>
        result.stepsInfo!.map((step: any) => ({
          asExpected: step.asExpected,
          locationInViewport: step.target.locationInViewport,
        })),
      ),
      [[{asExpected: true, locationInViewport: {x: 3, y: 4}}]],
    )
  })

  it('throws an error when dom snapshot returns an error', async () => {
    const driver = new MockDriver()
    driver.mockScript('dom-snapshot', () => JSON.stringify({status: 'ERROR', error: 'bla'}))
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 2, spec, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })
    await assert.rejects(eyes.check(), error => {
      return error.message === "Error during execute poll script: 'bla'"
    })
  })

  it('should throw an error on invalid dom snapshot JSON', async () => {
    const driver = new MockDriver()
    const response = Array.from({length: 200}, (_x, i) => i).join('')
    driver.mockScript('dom-snapshot', () => response)
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 2, spec, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })
    await assert.rejects(eyes.check(), error => {
      return (
        error.message ===
        `Response is not a valid JSON string. length: ${response.length}, first 100 chars: "${response.substr(
          0,
          100,
        )}", last 100 chars: "${response.substr(-100)}". error: SyntaxError: Unexpected number in JSON at position 1`
      )
    })
  })

  it('preserves original frame after checking window', async function () {
    const driver = new MockDriver()
    driver.mockElements([
      {
        selector: 'frame1-cors',
        frame: true,
        children: [{selector: 'element_cors'}],
      },
    ])
    driver.mockScript('dom-snapshot', async () => {
      return JSON.stringify({
        status: 'SUCCESS',
        value: {
          url: await driver.getUrl(),
          cdt: [{nodeType: 1, nodeName: 'IFRAME', attributes: []}],
          crossFrames: [{selector: 'frame1-cors', index: 0}],
          frames: [],
          resourceUrls: [],
          blobs: [],
        },
      })
    })
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 2, spec, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    const originalDocument = await driver.findElement('html')
    await eyes.check()
    const resultDocument = await driver.findElement('html')
    assert.deepStrictEqual(originalDocument, resultDocument)
  })

  it('adds unique id to duplicated renderers', async function () {
    const core = makeCore({base: makeFakeCore(), clients: {ufg: makeFakeClient()}, concurrency: 10})

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        name: 'good',
        renderers: [
          {name: 'firefox', width: 100, height: 100},
          {name: 'firefox', width: 100, height: 100},
        ],
      },
    })

    await eyes.close()
    const results = await eyes.getResults()

    assert.deepStrictEqual(
      results.map(result => result.renderer),
      [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', id: '1', width: 100, height: 100},
      ],
    )
    assert.deepStrictEqual(
      results.map(result => result.stepsInfo!.map((step: any) => step.asExpected)),
      [[true], [true]],
    )
  })

  it('aborts if ufg client throw during render', async () => {
    let aborted = true
    const fakeCore = makeFakeCore({
      hooks: {
        async abort() {
          aborted = true
        },
      },
    })
    const fakeClient = makeFakeClient({
      hooks: {
        async render() {
          throw new Error('render')
        },
      },
    })

    const core = makeCore({concurrency: 1, base: fakeCore as any, clients: {ufg: fakeClient}})

    const eyes1 = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes1.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes1.close()

    assert.strictEqual(aborted, true)
    await assert.rejects(eyes1.getResults(), error => error.message === 'render')
  })

  it('passes custom headers for resource fetching', async () => {
    const expectedHeaders = {
      Referer: 'referer',
      'User-Agent': 'custom-user-agent',
    }

    let actualHeaders: Record<string, string | undefined> | undefined
    const core = makeCore({
      base: makeFakeCore(),
      clients: {
        ufg: makeFakeClient({
          hooks: {
            createRenderTarget({settings}) {
              actualHeaders = settings?.headers
            },
          },
        }),
      },
      concurrency: 10,
    })

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    await eyes.check({
      target: {cdt: []},
      settings: {
        renderers: [{width: 320, height: 480}],
        headers: expectedHeaders,
      },
    })

    await eyes.close()
    await eyes.getResults()
    assert.deepStrictEqual(actualHeaders, expectedHeaders)
  })
})
