import {readFileSync} from 'fs'
import {testServer} from '@applitools/test-server'
import {transformDomMapping} from '../../src/utils/transform-dom-mapping'
import assert from 'assert'

describe('transform-settings', () => {
  describe('domMapping', () => {
    const expectedDomMapping = readFileSync('./test/fixtures/dom-mapping.json')

    let destroyServer: () => Promise<void>, baseUrl: string
    before(async () => {
      const server = await testServer()
      destroyServer = () => server.close()
      baseUrl = `http://localhost:${server.port}`
    })
    after(async () => {
      await destroyServer?.()
    })
    it('from filepath', async () => {
      const settings = {domMapping: './test/fixtures/dom-mapping.json'}
      await transformDomMapping(settings)
      assert.deepStrictEqual(settings.domMapping, expectedDomMapping)
    })
    it('from URL', async () => {
      const settings = {domMapping: baseUrl + '/dom-mapping.json'}
      await transformDomMapping(settings)
      assert.deepStrictEqual(settings.domMapping, expectedDomMapping)
    })
    it('from buffer', async () => {
      const settings = {domMapping: readFileSync('./test/fixtures/dom-mapping.json')}
      await transformDomMapping(settings)
      assert.deepStrictEqual(settings.domMapping, expectedDomMapping)
    })
  })
})
