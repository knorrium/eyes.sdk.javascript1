import type {LogEventSettings} from '../../src/types'
import {makeLogger} from '@applitools/logger'
import {makeFakeCore} from '../utils/fake-base-core'
import {makeLogEvent} from '../../src/log-event'
import assert from 'assert'
import * as utils from '@applitools/utils'

describe('log-event', () => {
  it('should populate settings from environment variables', async () => {
    const originalEnv = process.env
    try {
      const fakeCore = makeFakeCore({
        hooks: {
          logEvent({settings}) {
            ;(utils.types.isArray(settings) ? settings : [settings]).forEach(settings => {
              assert.strictEqual(settings.eyesServerUrl, process.env.APPLITOOLS_SERVER_URL)
              assert.strictEqual(settings.apiKey, process.env.APPLITOOLS_API_KEY)
            })
          },
        },
      })
      const logEvent = makeLogEvent({core: fakeCore as any, logger: makeLogger()})

      process.env = {
        APPLITOOLS_SERVER_URL: 'server-url',
        APPLITOOLS_API_KEY: 'api-key',
      }

      await logEvent({
        settings: [{event: {type: 'some-event-type-1'}}, {event: {type: 'some-event-type-2'}}] as LogEventSettings[],
      })
    } finally {
      process.env = originalEnv
    }
  })
})
