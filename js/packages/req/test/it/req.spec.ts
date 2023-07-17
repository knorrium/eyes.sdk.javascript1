import assert from 'assert'
import nock from 'nock'
import {Request} from 'node-fetch'
import {req} from '../../src/req.js'
import * as utils from '@applitools/utils'
import {AbortReasons} from '../../src/req-errors.js'

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

  it('aborts request on timeout', async () => {
    nock('https://eyesapi.applitools.com').get('/api/hello').delay(1100).reply(200, {hello: 'world'})

    await assert.rejects(
      () => req('https://eyesapi.applitools.com/api/hello', {connectionTimeout: 1000}),
      (error: Error) => error.constructor.name === 'ConnectionTimeoutError',
    )
  })

  it('aborts retry request on timeout', async () => {
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

  it('retry on stuck request', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .reply(async () => {
        index += 1
        await new Promise(res => setTimeout(res, 2000))
        return [200]
      })
      .persist()

    await assert.rejects(
      () =>
        req('https://eyesapi.applitools.com/api/hello', {
          requestTimeout: 500,
          connectionTimeout: 1000,
          retry: {
            codes: [AbortReasons.requestTimeout],
          },
        }),
      (error: Error) => error.constructor.name === 'ConnectionTimeoutError',
    )
    assert.deepStrictEqual(index, 2)
  })

  it('ignores retry on stuck request when retry code not specified', async () => {
    let index = 0
    nock('https://eyesapi.applitools.com')
      .get('/api/hello')
      .reply(async () => {
        index += 1
        await new Promise(res => setTimeout(res, 2000))
        return [200]
      })
      .persist()

    await assert.rejects(
      () =>
        req('https://eyesapi.applitools.com/api/hello', {
          requestTimeout: 500,
          connectionTimeout: 1000,
        }),
      (error: Error) => error.constructor.name === 'ConnectionTimeoutError',
    )
    assert.deepStrictEqual(index, 1)
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
})
