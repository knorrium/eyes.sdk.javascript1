import {MockDriver, spec} from '@applitools/driver/fake'
import {makeFakeCore} from '../../utils/fake-base-core'
import {makeCore} from '../../../src/classic/core'
import assert from 'assert'

describe('check', () => {
  it('formats environment os', async () => {
    const driver = new MockDriver({
      device: {isMobile: true, isNative: true},
      platform: {name: 'AnDrOiD', version: '10'},
    })

    const fakeCore = makeFakeCore({
      hooks: {
        openEyes({settings}) {
          assert.strictEqual(settings.environment?.os, 'Android 10')
        },
      },
    })
    const core = await makeCore({spec, base: fakeCore})

    await core.openEyes({
      target: driver,
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
  })
})
