import {type UFGRequests} from '../../src/server/requests'
import {makeCreateRenderTarget} from '../../src/create-render-target'
import {makeFetchResource} from '../../src/resources/fetch-resource'
import {makeUploadResource} from '../../src/resources/upload-resource'
import {makeProcessResources} from '../../src/resources/process-resources'
import {makeResourceDom} from '../../src/resources/resource-dom'
import {testServer} from '@applitools/test-server'
import {makeLogger} from '@applitools/logger'
import {makeFixtureResources as makeFixtureCssResources} from '../fixtures/page/test.css.resources'
import {makeFixtureResource as makeFixtureFrame1Resource} from '../fixtures/page/index.resource'
import {makeFixtureResource as makeFixtureFrame2Resource} from '../fixtures/page-with-frames/inner/frame.resource'
import assert from 'assert'
import {makeAsyncCache} from '../utils/fake-async-cache'

describe('create-render-target', () => {
  let server: any, baseUrl: string

  before(async () => {
    server = await testServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
  })

  it('works', async () => {
    const processResources = makeProcessResources({
      fetchResource: makeFetchResource({logger: makeLogger()}),
      uploadResource: makeUploadResource({
        requests: {
          checkResources: async ({resources}) => Array(resources.length).fill(true),
        } as UFGRequests,
        logger: makeLogger(),
      }),
      logger: makeLogger(),
    })
    const createRenderTarget = makeCreateRenderTarget({processResources, logger: makeLogger()})
    const pageUrl = `${baseUrl}/page-with-frames/index.html`
    const frame1Url = `${baseUrl}/page/index.html`
    const frame2Url = `${baseUrl}/page-with-frames/inner/frame.html`

    const snapshot = {
      url: pageUrl,
      cdt: [],
      resourceUrls: [],
      resourceContents: {},
      frames: [
        {
          url: frame1Url,
          cdt: require('../fixtures/page/index.cdt.json'),
          resourceUrls: [`${baseUrl}/page/test.css`],
          resourceContents: {},
        },
        {
          url: frame2Url,
          cdt: require('../fixtures/page-with-frames/inner/frame.cdt.json'),
          resourceUrls: [`${baseUrl}/page-with-frames/inner/smurfs.jpg`],
          resourceContents: {},
        },
      ],
    }

    const target = await createRenderTarget({snapshot})

    const expectedFrame1DomResource = makeFixtureFrame1Resource({baseUrl})
    assert.deepStrictEqual(target.resources[frame1Url], expectedFrame1DomResource.hash)

    const expectedFrame2DomResource = makeFixtureFrame2Resource({baseUrl})
    assert.deepStrictEqual(target.resources[frame2Url], expectedFrame2DomResource.hash)

    const expectedDomResource = makeResourceDom({
      cdt: [],
      resources: {
        [frame1Url]: expectedFrame1DomResource.hash,
        [frame2Url]: expectedFrame2DomResource.hash,
      },
    })
    assert.deepStrictEqual(target.snapshot, expectedDomResource.hash)
  })

  it('handles serialized resources (that came directly from DomSnapshot)', async () => {
    const processResources = makeProcessResources({
      fetchResource: makeFetchResource({logger: makeLogger()}),
      uploadResource: makeUploadResource({
        requests: {
          checkResources: async ({resources}) => Array(resources.length).fill(true),
        } as UFGRequests,
        logger: makeLogger(),
      }),
      logger: makeLogger(),
    })
    const createRenderTarget = makeCreateRenderTarget({processResources, logger: makeLogger()})

    const snapshot = {
      url: 'page.url',
      cdt: [],
      resourceUrls: [],
      resourceContents: {
        'url-1': {
          value: 'YWJj', //Buffer.from('abc').toString('base64'),
          type: 'some/content',
        },
      },
    }

    const target = await createRenderTarget({snapshot})

    assert.deepStrictEqual(target.resources, {
      'url-1': {
        hashFormat: 'sha256',
        hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', // crypto.createHash('sha256').update('abc').digest('hex')
        contentType: 'some/content',
      },
    })
  })

  it('handles async cache', async () => {
    const asyncCache = makeAsyncCache()
    const processResources = makeProcessResources({
      fetchResource: makeFetchResource({logger: makeLogger()}),
      uploadResource: makeUploadResource({
        requests: {
          checkResources: async ({resources}) => Array(resources.length).fill(true),
        } as UFGRequests,
        logger: makeLogger(),
      }),
      logger: makeLogger(),
      asyncCache,
    })
    const createRenderTarget = makeCreateRenderTarget({processResources, logger: makeLogger()})

    const resourceUrl = `${baseUrl}/page/smurfs1.jpg`

    const snapshot = {
      url: 'page.url',
      cdt: [],
      resourceUrls: [resourceUrl],
      resourceContents: {
        'url-1': {
          value: 'YWJj', //Buffer.from('abc').toString('base64'),
          type: 'some/content',
        },
      },
    }

    const target = await createRenderTarget({snapshot})

    const expectedUrl1Hash = {
      hashFormat: 'sha256',
      hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', // crypto.createHash('sha256').update('abc').digest('hex')
      contentType: 'some/content',
    }

    const resourceMapping = makeFixtureCssResources({baseUrl})

    const expectedDomResource = makeResourceDom({
      cdt: [],
      resources: {
        'url-1': expectedUrl1Hash,
        [resourceUrl]: resourceMapping[resourceUrl],
      },
    })

    assert.deepStrictEqual(target.resources, {
      'url-1': expectedUrl1Hash,
      [resourceUrl]: resourceMapping[resourceUrl],
    })

    assert.deepStrictEqual(Object.fromEntries(asyncCache.getUploadCache().entries()), {
      [`${JSON.stringify(expectedDomResource.hash)}`]: true,
      [`${JSON.stringify(expectedUrl1Hash)}`]: true,
      [`${JSON.stringify(resourceMapping[resourceUrl])}`]: true,
    })

    assert.deepStrictEqual(Object.fromEntries(asyncCache.getFetchCache().entries()), {
      [`${expectedDomResource.id}`]: {
        dependencies: undefined,
        hash: expectedDomResource.hash,
      },
      'url-1': {
        dependencies: undefined,
        hash: {
          hashFormat: 'sha256',
          hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
          contentType: 'some/content',
        },
      },
      [resourceUrl]: {
        dependencies: [],
        hash: resourceMapping[resourceUrl],
      },
    })
  })
})
