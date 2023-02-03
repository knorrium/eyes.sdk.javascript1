import {extractBrokerUrl} from '../../src/utils/extract-broker-url'
import assert from 'assert'

describe('extractBrokerUrl', () => {
  it('works', async () => {
    const driver = {
      isIOS: null,
      isAndroid: true,
      element: async () => {
        return {
          getText: async () => {
            return '{"error":"","nextPath":"http://blah"}'
          }
        }
      },
    }
    assert.deepStrictEqual(await extractBrokerUrl(driver as any), 'http://blah')
  })
  it('works with retry', async () => {
    let count = 0
    const driver = {
      isIOS: null,
      isAndroid: true,
      element: async () => {
        return {
          getText: async () => {
            count++
            return count < 5 ? '{"error":"","nextPath":null}' : '{"error":"","nextPath":"http://blah"}'
          }
        }
      },
    }
    assert.deepStrictEqual(await extractBrokerUrl(driver as any), 'http://blah')
  })
})
