import {makeLogger} from '@applitools/logger'
import {makeFetchResource} from '../../src/resources/fetch-resource'
import {makeResource} from '../../src/resources/resource'
import {makeTestServer, generateCertificate} from '@applitools/test-server'
import assert from 'assert'

describe('fetch-resource', () => {
  let server: any

  afterEach(async () => {
    await server.close()
  })

  it('works with a self-signed certificate', async () => {
    const authority = await generateCertificate({days: 1})
    server = await makeTestServer({...authority})
    const fetchResource = makeFetchResource({retryLimit: 0, logger: makeLogger()})
    const resource = await fetchResource({
      resource: makeResource({url: `https://localhost:${server.port}/page/smurfs.jpg`}),
    })
    assert.strictEqual((resource.hash as any).contentType, 'image/jpeg')
  })

  it('does not hang for unresponsive resource', async () => {
    server = await makeTestServer({
      middlewares: ['slow'],
    })

    const fetchResource = makeFetchResource({retryLimit: 1, timeout: 1000, logger: makeLogger()})
    await assert.rejects(
      fetchResource({
        resource: makeResource({url: `http://localhost:${server.port}/page/smurfs.jpg`}),
      }),
      err => err.constructor.name === 'ConnectionTimeoutError',
    )
  })
})
