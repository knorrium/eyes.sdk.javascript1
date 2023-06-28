import {makeCore} from '../../src/index'
import * as spec from '@applitools/spec-driver-webdriverio'

describe('native ios (@sauce)', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      //url: 'http://0.0.0.0:4723/wd/hub',
      device: 'iPhone 13',
      app: 'https://applitools.jfrog.io/artifactory/ufg-mobile/UFGTestApp.app.zip',
      injectUFGLib: true,
      withNML: true,
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works in classic mode', async () => {
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      type: 'classic',
      target: driver,
      settings: {appName: 'core app', testName: 'native classic ios nml'},
    })
    await eyes.check({settings: {screenshotMode: 'applitools-lib'}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})
