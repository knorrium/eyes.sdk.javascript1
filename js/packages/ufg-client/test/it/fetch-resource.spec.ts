import {makeFetchResource} from '../../src/resources/fetch-resource'
import {makeResource} from '../../src/resources/resource'
import {makeTestServer, generateCertificate} from '@applitools/test-server'
import assert from 'assert'

describe('fetch-resource', () => {
  let server: any

  before(async () => {
    const authority = await generateCertificate({days: 1})
    server = await makeTestServer({...authority, port: 12345})
  })

  after(async () => {
    await server.close()
  })

  it('works with a self-signed certificate', async () => {
    const fetchResource = makeFetchResource({retryLimit: 0})
    const resource = await fetchResource({
      resource: makeResource({url: `https://localhost:${server.port}/page/smurfs.jpg`}),
    })
    assert.strictEqual((resource.hash as any).contentType, 'image/jpeg')
  })
})
