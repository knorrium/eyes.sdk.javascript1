import {AbortController} from 'abort-controller'
import {Builder} from 'selenium-webdriver'
import {Command} from 'selenium-webdriver/lib/command'
import {makeLogger} from '@applitools/logger'
import {makeServer} from '../../src/server'
import * as utils from '@applitools/utils'
import req from '@applitools/req'
import nock from 'nock'
import assert from 'assert'

describe('server', () => {
  let proxy: any

  afterEach(async () => {
    nock.cleanAll()
    await proxy.close()
  })

  it('proxies webdriver requests', async () => {
    proxy = await makeServer({settings: {serverUrl: 'https://exec-wus.applitools.com'}, logger: makeLogger()})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    nock('https://exec-wus.applitools.com').persist().delete('/session/session-guid').reply(200, {value: null})

    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
    const capabilities = await driver.getCapabilities()
    assert.strictEqual(capabilities.get('applitools:isECClient'), true)
    await driver.quit()
  })

  it('performs retries on concurrency and availability errors', async () => {
    proxy = await makeServer({settings: {serverUrl: 'https://exec-wus.applitools.com'}, logger: makeLogger()})

    let retries = 0
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        retries += 1
        if (retries <= 2) {
          return [
            500,
            {
              value: {
                error: 'session not created',
                message: 'Session not created',
                stacktrace: '',
                data: {appliErrorCode: retries === 1 ? 'CONCURRENCY_LIMIT_REACHED' : 'NO_AVAILABLE_DRIVER_POD'},
              },
            },
          ]
        }

        return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
      })

    await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
  })

  it('adds `applitools:` capabilities from default capabilities', async () => {
    proxy = await makeServer({
      settings: {
        serverUrl: 'https://exec-wus.applitools.com',
        options: {apiKey: 'api-key', eyesServerUrl: 'http://server.url'},
      },
      logger: makeLogger(),
    })

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply((_url, body) => {
        const {capabilities} = body as Record<string, any>
        if (
          capabilities.alwaysMatch['applitools:apiKey'] === 'api-key' &&
          capabilities.alwaysMatch['applitools:eyesServerUrl'] === 'http://server.url'
        ) {
          return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
        } else {
          return [
            400,
            {
              value: {
                error: 'session not created',
                message: 'Session not created',
                stacktrace: '',
                data: {appliErrorCode: 'VALIDATION_ERROR'},
              },
            },
          ]
        }
      })

    await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
  })

  it('adds `applitools:` capabilities from provided `applitools:options` capability', async () => {
    proxy = await makeServer({settings: {serverUrl: 'https://exec-wus.applitools.com'}, logger: makeLogger()})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply((_url, body) => {
        const {capabilities} = body as Record<string, any>
        if (
          capabilities.alwaysMatch['applitools:apiKey'] === 'api-key' &&
          capabilities.alwaysMatch['applitools:eyesServerUrl'] === 'http://server.url'
        ) {
          return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
        } else {
          return [
            400,
            {
              value: {
                error: 'session not created',
                message: 'Session not created',
                stacktrace: '',
                data: {appliErrorCode: 'VALIDATION_ERROR'},
              },
            },
          ]
        }
      })

    await new Builder()
      .withCapabilities({
        browserName: 'chrome',
        'applitools:options': {apiKey: 'api-key', eyesServerUrl: 'http://server.url'},
      })
      .usingServer(proxy.url)
      .build()
  })

  it('creates new tunnel when session is successfully created', async () => {
    proxy = await makeServer({
      settings: {serverUrl: 'https://exec-wus.applitools.com', tunnel: {serverUrl: 'http://eg-tunnel'}},
      logger: makeLogger(),
    })

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    let isTunnelCreated = false
    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(() => {
        isTunnelCreated = true
        return [201, '"tunnel-id"']
      })

    await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()

    assert.strictEqual(isTunnelCreated, true)
  })

  it('fails if new tunnel was not created', async () => {
    proxy = await makeServer({
      settings: {serverUrl: 'https://exec-wus.applitools.com', tunnel: {serverUrl: 'http://eg-tunnel'}},
      logger: makeLogger(),
    })

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
      })

    nock('http://eg-tunnel').persist().post('/tunnels').reply(401, {message: 'UNAUTHORIZED'})

    assert.rejects(
      new Builder().withCapabilities({browserName: 'chrome', 'applitools:tunnel': true}).usingServer(proxy.url).build(),
      (err: Error) => err.message.includes('UNAUTHORIZED'),
    )
  })

  it('deletes tunnel when session is successfully deleted', async () => {
    proxy = await makeServer({
      settings: {
        serverUrl: 'https://exec-wus.applitools.com',
        tunnel: {serverUrl: 'http://eg-tunnel', pool: {timeout: {idle: 0}}},
      },
      logger: makeLogger(),
    })

    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    nock('https://exec-wus.applitools.com').persist().delete('/session/session-guid').reply(200)

    nock('http://eg-tunnel').persist().post('/tunnels').reply(201, '"tunnel-id"')

    let isTunnelDeleted = false
    nock('http://eg-tunnel')
      .persist()
      .delete('/tunnels/tunnel-id')
      .reply(() => {
        isTunnelDeleted = true
        return [200, {}]
      })

    const driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(proxy.url)
      .build()

    await driver.quit()

    assert.strictEqual(isTunnelDeleted, true)
  })

  it('aborts proxy request if incoming request was aborted', async () => {
    proxy = await makeServer({settings: {serverUrl: 'https://exec-wus.applitools.com'}, logger: makeLogger()})

    let count = 0
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        count += 1
        return [
          500,
          {
            value: {
              error: 'session not created',
              message: 'Session not created',
              stacktrace: '',
              data: {appliErrorCode: 'NO_AVAILABLE_DRIVER_POD'},
            },
          },
        ]
      })

    try {
      const controller = new AbortController()
      req(`${proxy.url}/session`, {
        method: 'post',
        body: {capabilities: {alwaysMatch: {browserName: 'chrome'}}},
        signal: controller.signal,
      })
      setTimeout(() => controller.abort(), 1000)
    } catch (err: any) {
      if (err.name !== 'AbortError') throw err
    }
    await utils.general.sleep(3000)

    assert.strictEqual(count, 1)
  })

  it('queue create session requests if they need retry', async () => {
    proxy = await makeServer({settings: {serverUrl: 'https://exec-wus.applitools.com'}, logger: makeLogger()})

    let runningCount = 0
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(() => {
        if (runningCount < 2) {
          runningCount += 1
          setTimeout(() => (runningCount -= 1), 10_000)
          return [200, {value: {capabilities: {}, sessionId: 'session-guid'}}]
        }
        return [
          500,
          {
            value: {
              error: 'session not created',
              message: 'Session not created',
              stacktrace: '',
              data: {appliErrorCode: 'NO_AVAILABLE_DRIVER_POD'},
            },
          },
        ]
      })

    await Promise.all(
      Array.from({length: 5}).map(async (_, _index) => {
        await new Builder().withCapabilities({browserName: 'chrome'}).usingServer(proxy.url).build()
      }),
    )
  })

  it('returns session details', async () => {
    proxy = await makeServer({settings: {serverUrl: 'https://exec-wus.applitools.com'}, logger: makeLogger()})
    const sessionId = 'session-guid'
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId}})

    nock('https://exec-wus.applitools.com')
      .persist()
      .get(`/session/${sessionId}`)
      .reply(200, {
        value: {
          sessionId,
          applitools: true,
        },
      })

    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
    driver.getExecutor().defineCommand('getSessionDetails', 'GET', '/session/:sessionId')
    const result = await driver.execute(new Command('getSessionDetails'))
    assert.deepStrictEqual(result, {sessionId, applitools: true})
  })

  it('find element works with self healing', async () => {
    proxy = await makeServer({
      settings: {serverUrl: 'https://exec-wus.applitools.com', options: {useSelfHealing: true}},
      logger: makeLogger(),
    })
    const expected = {
      successfulSelector: {using: 'css selector', value: 'actual-selector'},
      unsuccessfulSelector: {using: 'css selector', value: 'blah'},
    }
    const sessionId = 'session-guid'
    nock('https://exec-wus.applitools.com')
      .persist()
      .post('/session')
      .reply(200, {value: {capabilities: {}, sessionId: 'session-guid'}})

    nock('https://exec-wus.applitools.com')
      .persist()
      .post(`/session/${sessionId}/element`)
      .reply(200, {
        value: {'element-12345': 'blahblahblah'},
        appliCustomData: {
          selfHealing: expected,
        },
      })

    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()
    await driver.findElement({css: 'blah'})
    const result: any[] = await driver.executeScript('applitools:metadata')
    assert.deepStrictEqual(result, [expected])
    const noResult: any[] = await driver.executeScript('applitools:metadata')
    assert.deepStrictEqual(noResult, [])
  })
})
