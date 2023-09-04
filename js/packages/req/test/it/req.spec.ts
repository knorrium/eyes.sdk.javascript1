import assert from 'assert'
import nock from 'nock'
import {Request} from 'node-fetch'
import {req} from '../../src/req.js'
import {AbortCode} from '../../src/req-errors.js'
import {AbortController} from 'abort-controller'
import * as utils from '@applitools/utils'
import {Fallback} from '../../src/types.js'

describe('req', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('works', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(200, {hello: 'world'})
    const response = await req('https://eyesapi.applitools.com/api/hello')

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('merges url with base url', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(200, {hello: 'world'})

    const response = await req('./hello', {baseUrl: 'https://eyesapi.applitools.com/api/'})

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('merges query params to url', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello?init=true&hello=world').reply(200, {hello: 'world'})

    const response = await req('https://eyesapi.applitools.com/api/hello?init=true', {query: {hello: 'world'}})

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('merges headers', async () => {
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .matchHeader('Custom-Header', 'true')
      .reply(200, {hello: 'world'})

    const response = await req(
      new Request('https://eyesapi.applitools.com/api/hello', {headers: {'custom-header': 'false'}}),
      {
        headers: {'Custom-Header': 'true'},
      },
    )

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('serializes body of null', async () => {
    nock('https://eyesapi.applitools.com')
      .post('/api/hello')
      .matchHeader('content-type', 'application/json')
      .reply((_url, body) => {
        if (body === null) return [200, {hello: 'world'}]
        else return [500]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      method: 'post',
      headers: {'content-type': 'application/json'},
      body: null,
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('retries on configured error codes', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .reply(function () {
        if (index++ > 0) this.req.destroy()
        return [200, {hello: 'world'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{codes: ['ECONNRESET']}],
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('retries on configured status codes', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(2)
      .reply(() => {
        return index++ > 0 ? [200, {hello: 'world'}] : [500]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500]}],
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('retries on configured status codes with limit', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').times(3).reply(500, {hello: 'error'})

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500], limit: 2}],
    })

    assert.strictEqual(response.status, 500)
    assert.deepStrictEqual(await response.json(), {hello: 'error'})
  })

  it('retries on configured status codes with timeout', async () => {
    let prevRequestTimestamp: number
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(2)
      .reply(() => {
        if (prevRequestTimestamp) assert.ok(Date.now() - prevRequestTimestamp >= 1000)
        prevRequestTimestamp = Date.now()
        return [500, {hello: 'error'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500], limit: 1, timeout: 1000}],
    })

    assert.strictEqual(response.status, 500)
    assert.deepStrictEqual(await response.json(), {hello: 'error'})
  })

  it('retries on configured status codes with timeout backoff', async () => {
    const expectedRetryIntervals = [100, 150, 200, 200]
    let index = -1
    let prevRequestTimestamp: number
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(5)
      .reply(() => {
        // if retry
        if (index >= 0) {
          assert.ok(Date.now() - prevRequestTimestamp >= expectedRetryIntervals[index])
        }
        prevRequestTimestamp = Date.now()
        index += 1
        return [500, {hello: 'error'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: [{statuses: [500], limit: 4, timeout: [100, 150, 200]}],
    })

    assert.strictEqual(response.status, 500)
    assert.deepStrictEqual(await response.json(), {hello: 'error'})
  })

  it('retries on stuck request', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .reply(async () => {
        index += 1
        await new Promise(res => setTimeout(res, 2000))
        return [200]
      })
      .persist()

    const requestTimeout = 500
    const connectionTimeout = 1100
    const startedAt = Date.now()
    await assert.rejects(
      () =>
        req('https://eyesapi.applitools.com/api/hello', {
          retry: {codes: [AbortCode.requestTimeout]},
          requestTimeout,
          connectionTimeout,
        }),
      (error: Error) => error.constructor.name === 'ConnectionTimeoutError',
    )
    const duration = Date.now() - startedAt

    assert.strictEqual(index, 3)
    assert.ok(duration > connectionTimeout && duration < requestTimeout * index)
  })

  it('aborts request on connection timeout', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').delay(1100).reply(200, {hello: 'world'})

    await assert.rejects(
      () => req('https://eyesapi.applitools.com/api/hello', {connectionTimeout: 1000}),
      (error: Error) => error.constructor.name === 'ConnectionTimeoutError',
    )
  })

  it('aborts retry request on connection timeout', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(500).persist()

    await assert.rejects(
      () =>
        req('https://eyesapi.applitools.com/api/hello', {
          retry: {validate: ({response}) => response?.status === 500},
          connectionTimeout: 1000,
        }),
      (error: Error) => error.constructor.name === 'ConnectionTimeoutError',
    )
  })

  it('aborts request if signal is already aborted', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(500).persist()

    const controller = new AbortController()
    controller.abort()

    await assert.rejects(
      () => req('https://eyesapi.applitools.com/api/hello', {signal: controller.signal}),
      (error: Error) => error.constructor.name === 'AbortError',
    )
  })

  it('aborts request with timeout if signal is already aborted', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').reply(500).persist()

    const controller = new AbortController()
    controller.abort()

    await assert.rejects(
      () => req('https://eyesapi.applitools.com/api/hello', {signal: controller.signal, connectionTimeout: 1000}),
      (error: Error) => error.constructor.name === 'AbortError',
    )
  })

  it('executes hooks', async () => {
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .matchHeader('before-request', 'true')
      .reply(200, {hello: 'world'})
    const response = await req('https://eyesapi.applitools.com/api/hello', {
      hooks: {
        beforeRequest: ({request}) => request.headers.set('before-request', 'true'),
        afterResponse: ({response}) => response.headers.set('after-response', 'true'),
      },
    })

    assert.strictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
    assert.deepStrictEqual(await response.headers.get('after-response'), 'true')
  })

  it("doesn't hangs when cloning 100mb response body", async () => {
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .reply(200, Buffer.alloc(1024 * 1024 * 100).fill('?'))

    const response = await req('https://eyesapi.applitools.com/api/hello')

    await Promise.race([
      response.clone().arrayBuffer(),
      utils.general.sleep(3000)?.then(() => Promise.reject(new Error('hangs'))),
    ])
  })

  it('fallback work', async () => {
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .twice()
      .reply(function () {
        if (!this.req.headers.fallback) return [400]
        return [200, {hello: 'world'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      fallbacks: [
        {
          shouldFallbackCondition: () => {
            return true
          },
          updateOptions: ({options}) => {
            const headers = {
              ...options.headers,
              fallback: 'true',
            }
            return {...options, headers}
          },
        },
      ],
    })
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('fallback with retry', async () => {
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(3)
      .reply(function () {
        if (!this.req.headers.fallback) return [400]
        return [200, {hello: 'world'}]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      fallbacks: [
        {
          shouldFallbackCondition: () => {
            return true
          },
          updateOptions: ({options}) => {
            options.headers = {
              ...options.headers,
              fallback: 'true',
            }
            return options
          },
        },
      ],
      retry: [{statuses: [400]}],
    })
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('fallback that not return ok', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').times(3).reply(500)

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      fallbacks: [
        {
          shouldFallbackCondition: () => {
            return true
          },
          updateOptions: ({options}) => {
            options.headers = {
              ...options.headers,
              fallback: 'true',
            }
            return options
          },
        },
      ],
    })
    assert.deepStrictEqual(response.status, 500)
  })

  it('fallback and retry that not return ok', async () => {
    const server = nock('https://eyesapi.applitools.com')
    server.get('/api/hello').once().reply(403) // original request
    server.get('/api/hello').once().reply(403) // fallback 1
    server.get('/api/hello').once().reply(403) // fallback 2
    server.get('/api/hello').once().reply(500) // fallback 3
    server.get('/api/hello').once().reply(500) // retry 1
    server.get('/api/hello').once().reply(200, {hello: 'world'}) // retry 2

    const fallbacks = new Array<Fallback>(3).fill({
      shouldFallbackCondition: ({response}) => {
        return response.status === 403
      },
      updateOptions: ({options}) => options,
    })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      retry: {limit: 2, statuses: [500]},
      fallbacks,
    })

    assert.deepStrictEqual(nock.activeMocks(), [])
    assert.deepStrictEqual(response.status, 200)
    assert.deepStrictEqual(await response.json(), {hello: 'world'})
  })

  it('fallback change http agent', async () => {
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .times(2)
      .reply(function () {
        if (!(this.req as any).options.agent.keepAlive) return [403]
        return [200]
      })

    const response = await req('https://eyesapi.applitools.com/api/hello', {
      fallbacks: [
        {
          shouldFallbackCondition: () => {
            return true
          },
          updateOptions: ({options}) => {
            options.keepAliveOptions = {keepAlive: true}
            return options
          },
        },
      ],
    })
    assert.deepStrictEqual(response.ok, true)
  })
})
