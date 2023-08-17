import {makeCore, type Core} from '../../src/index'
import {type SpecType} from '@applitools/driver'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('locate web', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>, 'classic' | 'ufg'>

  before(async () => {
    core = makeCore({spec})
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('returns correct coordinates for web page', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/')
    const regions = await core.locate({
      target: driver,
      settings: {appName: 'core e2e helloworld', locatorNames: ['button']},
    })

    assert.deepStrictEqual(regions, {
      button: [{x: 351, y: 330, width: 98, height: 34}],
    })

    await driver.performActions([
      {
        type: 'pointer',
        id: 'mouse',
        parameters: {pointerType: 'mouse'},
        actions: [
          {
            type: 'pointerMove',
            duration: 0,
            x: regions.button[0].x + regions.button[0].width / 2,
            y: regions.button[0].y + regions.button[0].height / 2,
          },
          {type: 'pointerDown', button: 0},
          {type: 'pointerUp', button: 0},
        ],
      },
    ])
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e helloworld', testName: 'region located'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})

describe('locate web emulator', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>, 'classic' | 'ufg'>

  before(async () => {
    core = makeCore({spec})
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', emulation: 'Android 8.0'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('returns correct coordinates for web emulator page', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/')
    await driver.executeScript(`document.querySelector('meta[name=viewport]').setAttribute('content', '')`, [])
    const regions = await core.locate({
      target: driver,
      settings: {appName: 'core e2e helloworld emulator', locatorNames: ['button']},
    })

    assert.deepStrictEqual(regions, {
      button: [{x: 441.5104189967355, y: 329.2187517374502, width: 99.53125052527564, height: 35.72916685522715}],
    })

    await driver.performActions([
      {
        type: 'pointer',
        id: 'mouse',
        parameters: {pointerType: 'mouse'},
        actions: [
          {
            type: 'pointerMove',
            duration: 0,
            x: Math.round(regions.button[0].x + regions.button[0].width / 2),
            y: Math.round(regions.button[0].y + regions.button[0].height / 2),
          },
          {type: 'pointerDown', button: 0},
          {type: 'pointerUp', button: 0},
        ],
      },
    ])
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e helloworld emulator', testName: 'region located'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})

describe('locate ios (@sauce)', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>, 'classic' | 'ufg'>

  before(async () => {
    core = makeCore({spec})
    ;[driver, destroyDriver] = await spec.build({
      device: 'iPhone 13',
      app: 'https://applitools.jfrog.io/artifactory/Examples/eyes-ios-hello-world/1.2/eyes-ios-hello-world.zip',
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('returns correct coordinates for ios app', async () => {
    const regions = await core.locate({
      target: driver,
      settings: {appName: 'core e2e helloworld ios', locatorNames: ['button']},
    })

    assert.deepStrictEqual(regions, {
      button: [{x: 163, y: 324, width: 65, height: 13}],
    })

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger',
        parameters: {pointerType: 'touch'},
        actions: [
          {
            type: 'pointerMove',
            duration: 0,
            x: regions.button[0].x + regions.button[0].width / 2,
            y: regions.button[0].y + regions.button[0].height / 2,
          },
          {type: 'pointerDown', button: 0},
          {type: 'pause', duration: 500},
          {type: 'pointerUp', button: 0},
        ],
      },
    ])
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e helloworld ios', testName: 'region located'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})

describe('locate android (@sauce)', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>, 'classic' | 'ufg'>

  before(async () => {
    core = makeCore({spec})
    ;[driver, destroyDriver] = await spec.build({
      device: 'Pixel 4 XL',
      app: 'https://applitools.jfrog.io/artifactory/Examples/eyes-android-hello-world.apk',
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('returns correct coordinates for android app', async () => {
    const regions = await core.locate({
      target: driver,
      settings: {appName: 'core e2e helloworld android', locatorNames: ['button']},
    })

    assert.deepStrictEqual(regions, {
      button: [{x: 429, y: 737, width: 228.25, height: 101.75}],
    })

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger',
        parameters: {pointerType: 'touch'},
        actions: [
          {
            type: 'pointerMove',
            duration: 0,
            x: regions.button[0].x + regions.button[0].width / 2,
            y: regions.button[0].y + regions.button[0].height / 2,
          },
          {type: 'pointerDown', button: 0},
          {type: 'pause', duration: 500},
          {type: 'pointerUp', button: 0},
        ],
      },
    ])
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e helloworld android', testName: 'region located'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})
