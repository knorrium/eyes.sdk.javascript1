import {makeCore} from '../../src/index'
import * as spec from '@applitools/spec-driver-webdriver'

describe('native ios (@sauce)', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      //url: 'http://0.0.0.0:4723/wd/hub',
      device: 'iPhone 13',
      app: 'https://applitools.jfrog.io/artifactory/ufg-mobile/UIKitCatalog.app.zip',
      capabilities: {
        'appium:processArguments': {
          args: [],
          env: {
            DYLD_INSERT_LIBRARIES:
              '@executable_path/Frameworks/Applitools_iOS.xcframework/ios-arm64/Applitools_iOS.framework/Applitools_iOS:@executable_path/Frameworks/Applitools_iOS.xcframework/ios-arm64_x86_64-simulator/Applitools_iOS.framework/Applitools_iOS',
            APPLITOOLS_API_KEY: process.env.APPLITOOLS_API_KEY,
          },
        },
      },
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works in applitools-lib mode', async () => {
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

  it('works in applitools-lib mode with multiple renderers', async () => {
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      type: 'classic',
      target: driver,
      settings: {appName: 'core app', testName: 'native classic ios nml'},
    })
    await eyes.check({
      settings: {
        screenshotMode: 'applitools-lib',
        renderers: [
          {iosDeviceInfo: {deviceName: 'iPhone SE (3rd generation)'}},
          {iosDeviceInfo: {deviceName: 'iPhone 11 Pro'}},
        ],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })

  it('works in applitools-lib and default mode with multiple renderers', async () => {
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      type: 'classic',
      target: driver,
      settings: {appName: 'core app', testName: 'both modes native classic ios nml'},
    })
    await eyes.check({
      settings: {
        name: 'applitools lib',
        screenshotMode: 'applitools-lib',
        renderers: [
          {iosDeviceInfo: {deviceName: 'iPhone SE (3rd generation)'}},
          {iosDeviceInfo: {deviceName: 'iPhone 11 Pro'}},
        ],
      },
    })
    await eyes.check({
      settings: {
        name: 'default',
        screenshotMode: 'default',
        renderers: [
          {iosDeviceInfo: {deviceName: 'iPhone SE (3rd generation)'}},
          {iosDeviceInfo: {deviceName: 'iPhone 11 Pro'}},
        ],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})
