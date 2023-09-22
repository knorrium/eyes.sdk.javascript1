import {makeResource, type ContentfulResource, type FailedResource} from '../../src/resources/resource'
import {makeFetchResource} from '../../src/resources/fetch-resource'
import {makeLogger} from '@applitools/logger'
import assert from 'assert'
import nock from 'nock'
import * as utils from '@applitools/utils'

describe('fetch-resource', () => {
  const mockResource = makeResource({
    url: 'http://something',
    contentType: 'some/content-type',
    value: new TextEncoder().encode('bla'),
  })
  const urlResource = makeResource({url: mockResource.url})

  it('fetches with content and content-type', async () => {
    const fetchResource = makeFetchResource({retryLimit: 0, logger: makeLogger()})
    nock(mockResource.url)
      .get('/')
      .reply(200, Buffer.from(mockResource.value), {'content-type': mockResource.contentType})

    const resource = await fetchResource({resource: urlResource})
    assert.deepStrictEqual(resource, mockResource)
  })

  it('fetches with retries', async () => {
    let counter = 0
    nock(mockResource.url)
      .get('/')
      .times(3)
      .reply(() => {
        counter += 1
        if (counter < 3) return null
        return [200, Buffer.from(mockResource.value), {'content-type': mockResource.contentType}]
      })

    const fetchResource = makeFetchResource({retryLimit: 3, logger: makeLogger()})
    const resource = await fetchResource({resource: urlResource})
    assert.deepStrictEqual(resource, mockResource)
  })

  it('fetches with retries event though fails', async () => {
    let called = 0
    const dontFetch: any = () => ((called += 1), Promise.reject(new Error('DONT FETCH')))
    const fetchResource = makeFetchResource({retryLimit: 3, fetch: dontFetch, logger: makeLogger()})

    await assert.rejects(fetchResource({resource: urlResource}), new Error('DONT FETCH'))
    assert.strictEqual(called, 4)
  })

  it('stops retry and returns errosStatusCode when getting bad status', async () => {
    const fetchResource = makeFetchResource({retryLimit: 3, logger: makeLogger()})
    let called = 0
    nock(mockResource.url)
      .get('/')
      .reply(() => {
        called += 1
        return [404, null]
      })

    const resource = await fetchResource({resource: urlResource})
    assert.deepStrictEqual(resource, makeResource({id: urlResource.id, errorStatusCode: 404}))
    assert.strictEqual(called, 1)
  })

  it('caches requests', async () => {
    const fetchResource = makeFetchResource({retryLimit: 0, logger: makeLogger()})
    nock(mockResource.url)
      .get('/')
      .reply(200, Buffer.from(mockResource.value), {'content-type': mockResource.contentType})

    const [resource1, resource2] = await Promise.all([
      fetchResource({resource: urlResource}),
      fetchResource({resource: urlResource}),
    ])

    assert.deepStrictEqual(resource1, mockResource)
    assert.deepStrictEqual(resource2, mockResource)
  })

  it('fetch with concurrency limitation', async () => {
    const mockResources = Array.from({length: 10}, (_, index) => makeResource({url: `http://something/${index}`}))
    let count = 0
    nock('http://something').get(/\d+/).times(mockResources.length).reply(limitServerParallelRequests)

    const fetchResource = makeFetchResource({concurrency: 5, logger: makeLogger()})
    const resResources = await Promise.all(mockResources.map(resource => fetchResource({resource})))

    assert.strictEqual(
      resResources.some(resource => utils.types.has(resource, `errorStatusCode`)),
      false,
    )

    async function limitServerParallelRequests() {
      count += 1
      await utils.general.sleep(300)
      count -= 1
      return [count > 4 ? 504 : 200, 'font', {'Content-Type': `some-context-type`}]
    }
  })

  it('can fetch resources from tunnel', async () => {
    nock('https://exec-wus.applitools.com', {
      reqheaders: {
        'x-eyes-api-key': 'blah',
        'x-eyes-server-url': 'blah',
        'x-ufg-jwt-token': () => true,
        'x-tunnel-ids': '1,2,3',
      },
    })
      .post('/handle-resource')
      .reply(() => {
        return [
          200,
          Buffer.from(mockResource.value),
          {
            'Content-Type': 'application/octet-stream',
            'x-is-streaming-content': 'true',
            'x-resource-hash': '',
            'x-fetch-status-code': 222,
            'x-fetch-status-text': 'status text',
            'x-fetch-response-header-content-type': 'some/content-type',
          },
        ]
      })

    const fetchResource = makeFetchResource({
      eyesServerUrl: 'blah',
      apiKey: 'blah',
      accessToken: 'blah',
      tunnelIds: '1,2,3',
      logger: makeLogger(),
    })
    const resource = await fetchResource({resource: urlResource})
    assert.deepStrictEqual(resource as ContentfulResource, {
      id: mockResource.url,
      url: mockResource.url,
      value: mockResource.value,
      contentType: mockResource.contentType,
      hash: {
        hashFormat: 'sha256',
        hash: '4df3c3f68fcc83b27e9d42c90431a72499f17875c81a599b566c9889b9696703', //crypto.createHash('sha256').update(mockResource.value).digest('hex'),
        contentType: mockResource.contentType,
      },
      dependencies: undefined,
    })
  })

  it('handles resources with error status code from tunnel', async () => {
    nock('https://exec-wus.applitools.com', {
      reqheaders: {
        'x-eyes-api-key': 'blah',
        'x-eyes-server-url': 'blah',
        'x-ufg-jwt-token': () => true,
        'x-tunnel-ids': '1,2,3',
      },
    })
      .post('/handle-resource')
      .reply(() => {
        return [
          200,
          '',
          {
            'Content-Type': 'application/octet-stream',
            'x-fetch-status-code': 404,
            'x-fetch-status-text': 'not found',
          },
        ]
      })

    const fetchResource = makeFetchResource({
      eyesServerUrl: 'blah',
      apiKey: 'blah',
      accessToken: 'blah',
      tunnelIds: '1,2,3',
      logger: makeLogger(),
    })
    const resource = await fetchResource({resource: urlResource})
    assert.deepStrictEqual(resource as FailedResource, {
      id: mockResource.url,
      errorStatusCode: 404,
      hash: {
        errorStatusCode: 404,
      },
    })
  })

  describe('works with streamingTimeout', () => {
    const mockMediaResource = makeResource({
      url: 'http://something-media',
      contentType: 'audio/content-type',
      value: new TextEncoder().encode('bla'),
    })
    const urlMediaResource = makeResource({url: mockMediaResource.url})

    it('stop fetching media after streamingTimeout', async () => {
      nock(mockMediaResource.url)
        .get('/')
        .delayBody(200)
        .reply(200, Buffer.from(mockMediaResource.value), {'content-type': mockMediaResource.contentType})

      const fetchResource = makeFetchResource({streamingTimeout: 80, logger: makeLogger()})
      const resource = await fetchResource({resource: urlMediaResource})
      assert.deepStrictEqual(resource, makeResource({id: urlMediaResource.url, errorStatusCode: 599}))
    })

    it('doesnt include headers fetching time', async () => {
      nock(mockMediaResource.url)
        .get('/')
        .delay(200)
        .reply(200, Buffer.from(mockMediaResource.value), {'content-type': mockMediaResource.contentType})

      const fetchResource = makeFetchResource({streamingTimeout: 80, logger: makeLogger()})
      const resource = await fetchResource({resource: urlMediaResource})
      assert.deepStrictEqual(resource, mockMediaResource)
    })

    it('doesnt apply to requests with content-length', async () => {
      nock(mockMediaResource.url).get('/').delayBody(200).reply(200, Buffer.from(mockMediaResource.value), {
        'content-type': mockMediaResource.contentType,
        'content-length': '3',
      })

      const fetchResource = makeFetchResource({streamingTimeout: 80, logger: makeLogger()})
      const resource = await fetchResource({resource: urlMediaResource})
      assert.deepStrictEqual(resource, mockMediaResource)
    })

    it('doesnt apply to requests with non media content type', async () => {
      nock(mockResource.url)
        .get('/')
        .delayBody(200)
        .reply(200, Buffer.from(mockResource.value), {'content-type': mockResource.contentType})

      const fetchResource = makeFetchResource({streamingTimeout: 80, logger: makeLogger()})
      const resource = await fetchResource({resource: urlResource})
      assert.deepStrictEqual(resource, mockResource)
    })
  })
})
