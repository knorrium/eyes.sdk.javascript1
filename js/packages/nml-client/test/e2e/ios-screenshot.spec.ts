import {makeNMLClient} from '../../src/client'
import * as spec from '@applitools/spec-driver-webdriver'
import nock from 'nock'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.findElement('accessibility id', 'Applitools_View')
  const payload = await driver.getElementText(element['element-6066-11e4-a52e-4f735466cecf'])
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('ios screenshot', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  const renderEnvironmentsUrl = 'https://applitoolsnmlresources.z19.web.core.windows.net/devices-list.json'

  beforeEach(async () => {
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

  afterEach(async () => {
    await destroyDriver?.()
  })

  it('works', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const {takeScreenshots} = makeNMLClient({settings: {brokerUrl, renderEnvironmentsUrl}})
    const screenshots = await takeScreenshots({
      settings: {
        renderers: [{environment: {os: 'iOS', deviceName: 'iPhone', viewportSize: {width: 210, height: 700}}}],
        fully: true,
      },
    })

    screenshots.forEach(screenshot => {
      if (screenshot.image) screenshot.image = 'image-url'
      if (screenshot.renderEnvironment?.renderEnvironmentId) {
        screenshot.renderEnvironment.renderEnvironmentId = 'renderer-id'
      }
    })

    assert.deepStrictEqual(screenshots, [
      {
        image: 'image-url',
        renderEnvironment: {
          renderEnvironmentId: 'renderer-id',
          renderer: {environment: {os: 'iOS', deviceName: 'iPhone', viewportSize: {width: 210, height: 700}}},
          os: 'iOS',
          deviceName: 'iPhone',
          viewportSize: {width: 210, height: 700},
        },
      },
    ])
  })

  it('works with multiple renderers', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const {takeScreenshots} = makeNMLClient({settings: {brokerUrl, renderEnvironmentsUrl}})
    const screenshots = await takeScreenshots({
      settings: {
        renderers: [
          {iosDeviceInfo: {deviceName: 'iPhone SE (3rd generation)', version: '15.0'}},
          {iosDeviceInfo: {deviceName: 'iPhone 11 Pro', version: '14.0'}},
        ],
        fully: true,
      },
    })

    screenshots.forEach(screenshot => {
      if (screenshot.image) screenshot.image = 'image-url'
      if (screenshot.renderEnvironment?.renderEnvironmentId) {
        screenshot.renderEnvironment.renderEnvironmentId = 'renderer-id'
      }
    })

    assert.deepStrictEqual(screenshots, [
      {
        image: 'image-url',
        renderEnvironment: {
          renderEnvironmentId: 'renderer-id',
          renderer: {iosDeviceInfo: {deviceName: 'iPhone SE (3rd generation)', version: '15.0'}},
          deviceName: 'iPhone SE (3rd generation)',
          os: 'iOS 15.0',
          viewportSize: {width: 375, height: 667},
        },
      },
      {
        image: 'image-url',
        renderEnvironment: {
          renderEnvironmentId: 'renderer-id',
          renderer: {iosDeviceInfo: {deviceName: 'iPhone 11 Pro', version: '14.0'}},
          deviceName: 'iPhone 11 Pro',
          os: 'iOS 14.0',
          viewportSize: {width: 375, height: 812},
        },
      },
    ])
  })

  it('throws the error when one of the renderer failed', async () => {
    const renderEnvironmentsUrl = 'http://renderer-env-url.com'
    nock(renderEnvironmentsUrl)
      .get('/')
      .reply(200, {
        // NOTE: this renderer info causes problem for ios applitools lib because there is no portrait property with needed info
        'iPhone 13': {
          model: 'iPhone14,5',
          landscapeLeft: {
            env: {deviceInfo: 'iPhone 13', os: 'iOS', displaySize: {height: 844, width: 390}},
            safeAreaInsets: {right: 0, left: 0, top: 47, bottom: 34},
            statusBarHeight: 47,
          },
          realDeviceResolution: {height: 2532, pixelRatio: 3, width: 1170},
        },
      })

    const brokerUrl = await extractBrokerUrl(driver)
    const {takeScreenshots} = makeNMLClient({settings: {brokerUrl, renderEnvironmentsUrl}})
    await assert.rejects(
      takeScreenshots({
        settings: {
          renderers: [{iosDeviceInfo: {deviceName: 'iPhone 13', screenOrientation: 'landscape'}}],
          fully: true,
        },
      }),
      error => error.message.includes('There was a problem when interacting with the mobile application'),
    )
  })
})
