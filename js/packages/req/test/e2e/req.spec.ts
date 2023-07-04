import {makeTestServer} from '@applitools/test-server'
import {req} from '../../src/req.js'
import {execSync} from 'child_process'
import assert from 'assert'

describe('req', () => {
  let server: any
  before(async () => {
    server = await makeTestServer({
      middlewares: [(_req: any, res: any) => res.writeHead(418).send()],
    })
  })

  after(async () => {
    server?.close()
  })

  it('caches dns info', async () => {
    try {
      execSync('sudo npx hostile set 127.0.0.1 testhost')
      const response1 = await req(`http://testhost:${server.port}`, {useDnsCache: true})
      assert.strictEqual(response1.status, 418)

      execSync('sudo npx hostile set 127.0.0.2 testhost')
      const response2 = await req(`http://testhost:${server.port}`, {useDnsCache: true})
      assert.strictEqual(response2.status, 418)
    } finally {
      execSync('sudo npx hostile remove testhost')
    }
  })
})
