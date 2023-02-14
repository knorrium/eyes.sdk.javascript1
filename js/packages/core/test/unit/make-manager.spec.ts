import {makeLogger} from '@applitools/logger'
import {makeFakeCore} from '../utils/fake-base-core'
import {makeMakeManager} from '../../src/make-manager'
import assert from 'assert'

describe('make manager', () => {
  it('should populate batch from environment variables', async () => {
    const originalEnv = process.env
    try {
      const fakeCore = makeFakeCore({
        hooks: {
          openEyes({settings}) {
            assert.strictEqual(settings.batch!.id, process.env.APPLITOOLS_BATCH_ID)
          },
        },
      })
      const makeManager = makeMakeManager({core: fakeCore, logger: makeLogger()})

      process.env = {
        APPLITOOLS_BATCH_ID: 'batch-id',
      }

      const manager = await makeManager({type: 'classic'})
      await manager.openEyes({settings: {batch: {name: 'batch-name'}}})
    } finally {
      process.env = originalEnv
    }
  })
})
