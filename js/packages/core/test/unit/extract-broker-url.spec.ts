import {makeLogger} from '@applitools/logger'
import {extractBrokerUrl} from '../../src/ufg/utils/extract-broker-url'
import assert from 'assert'

describe('extractBrokerUrl', () => {
  const logger = makeLogger()

  it('works', async () => {
    const driver = {
      isNative: true,
      element: async () => {
        return {
          getText: async () => {
            return '{"error":"","nextPath":"http://blah"}'
          },
        }
      },
    }
    assert.deepStrictEqual(await extractBrokerUrl({driver: driver as any, logger}), 'http://blah')
  })

  it('works with retry', async () => {
    let count = 0
    const driver = {
      isNative: true,
      element: async () => {
        return {
          getText: async () => {
            count++
            return count < 3 ? '{"error":"","nextPath":null}' : '{"error":"","nextPath":"http://blah"}'
          },
        }
      },
    }
    assert.deepStrictEqual(await extractBrokerUrl({driver: driver as any, logger}), 'http://blah')
  })
})
