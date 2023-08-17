import assert from 'assert'
import {makeLogger} from '@applitools/logger'
import {MockDriver, spec} from '../../src/fake/index'
import {Driver} from '../../src/index'

const logger = makeLogger()

describe('driver', () => {
  let mock: spec.Driver, driver: Driver<any>

  before(async () => {
    mock = new MockDriver()
    mock.mockElements([
      {selector: 'frame0', frame: true},
      {
        selector: 'frame1',
        frame: true,
        isCORS: true,
        children: [
          {selector: 'frame1-0', frame: true, isCORS: true},
          {selector: 'frame1-1', frame: true},
          {selector: 'frame1-2', frame: true, isCORS: true},
        ],
      },
      {
        selector: 'frame2',
        frame: true,
        isCORS: true,
        children: [
          {selector: 'frame2-0', frame: true, isCORS: true},
          {
            selector: 'frame2-1',
            frame: true,
            isCORS: true,
            children: [
              {selector: 'frame2-1-0', frame: true, isCORS: true},
              {selector: 'frame2-1-1', frame: true},
              {selector: 'frame2-1-2', frame: true, isCORS: true},
            ],
          },
          {selector: 'frame2-2', frame: true},
        ],
      },
    ])
    driver = new Driver({logger, spec: {...spec}, driver: mock})
  })

  afterEach(async () => {
    await driver.switchToMainContext()
  })

  it('getTitle()', async () => {
    assert.strictEqual(await driver.getTitle(), 'Default Page Title')
  })

  it('getUrl()', async () => {
    assert.strictEqual(await driver.getUrl(), 'http://default.url')
  })

  it('switchToChildContext(element)', async () => {
    const frameElement = await mock.findElement('frame0')
    await driver.switchToChildContext(frameElement)
    assert.strictEqual(driver.currentContext.path.length, 2)
    assert.ok(await driver.currentContext.equals(frameElement))
  })

  it('switchToChildContext(eyes-element)', async () => {
    const frameElement = await driver.element('frame0')
    await driver.switchToChildContext(frameElement)
    assert.strictEqual(driver.currentContext.path.length, 2)
    assert.ok(await driver.currentContext.equals(frameElement!))
  })

  it('switchToMainContext()', async () => {
    const mainContextDocument = await driver.element('html')
    await driver.switchToChildContext('frame0')
    await driver.switchToMainContext()
    assert.strictEqual(driver.currentContext, driver.mainContext)
    const currentContextDocument = await driver.element('html')
    assert.ok(await mainContextDocument?.equals(currentContextDocument))
  })

  it('switchToParentContext()', async () => {
    const mainContextDocument = await driver.element('html')
    await driver.switchToChildContext('frame1')
    const nestedContextDocument = await driver.element('html')
    await driver.switchToChildContext('frame1-1')
    assert.strictEqual(driver.currentContext.path.length, 3)

    await driver.switchToParentContext()
    assert.strictEqual(driver.currentContext.path.length, 2)
    const parentContextDocument = await driver.element('html')
    assert.ok(await parentContextDocument?.equals(nestedContextDocument))

    await driver.switchToParentContext()
    assert.strictEqual(driver.currentContext, driver.mainContext)
    const grandparentContextDocument = await driver.element('html')
    assert.ok(await grandparentContextDocument?.equals(mainContextDocument))
  })

  it('switchTo(context)', async () => {
    const contextDocuments = [] as any[]
    contextDocuments.unshift(await driver.element('html'))
    for (const frameSelector of ['frame2', 'frame2-1', 'frame2-1-0']) {
      await driver.switchToChildContext(frameSelector)
      contextDocuments.unshift(await driver.element('html'))
    }
    assert.strictEqual(driver.currentContext.path.length, 4)
    const requiredContext = driver.currentContext

    await driver.switchToMainContext()
    assert.strictEqual(driver.currentContext, driver.mainContext)

    await driver.switchTo(requiredContext)
    assert.strictEqual(driver.currentContext, driver.currentContext)

    for (const contextDocument of contextDocuments) {
      const currentDocument = await driver.element('html')
      assert.ok(await currentDocument?.equals(contextDocument))
      await driver.switchToParentContext()
    }
  })

  describe('refresh()', () => {
    afterEach(async () => {
      await driver.switchToMainContext()
    })

    it('untracked same origin frame chain [(0-0)?]', () => {
      return untrackedFrameChainSameOrigin()
    })

    it('untracked cors frame chain [(0-1-2)?]', () => {
      return untrackedCorsFrameChain()
    })

    it('untracked mixed frame chain [(0-1-0)?]', () => {
      return untrackedMixedFrameChain1()
    })

    it('untracked mixed frame chain [(0-1-1)?]', () => {
      return untrackedMixedFrameChain2()
    })

    it('partially tracked frame chain [0-2-1-(2)?]', () => {
      return partiallyTrackedFrameChain1()
    })

    it('partially tracked frame chain [(0-2)?-1-2]', () => {
      return partiallyTrackedFrameChain2()
    })

    it('tracked frame chain [0-2-1-2]', () => {
      return trackedFrameChain()
    })
  })

  describe('refresh() when parentContext not implemented', () => {
    before(() => {
      // @ts-ignore
      delete driver._spec.parentContext
    })

    afterEach(async () => {
      await driver.switchToMainContext()
    })

    it('untracked same origin frame chain [(0-0)?]', () => {
      return untrackedFrameChainSameOrigin()
    })

    it('untracked cors frame chain [(0-1-2)?]', () => {
      return untrackedCorsFrameChain()
    })

    it('untracked mixed frame chain [(0-1-0)?]', () => {
      return untrackedMixedFrameChain1()
    })

    it('untracked mixed frame chain [(0-1-1)?]', () => {
      return untrackedMixedFrameChain2()
    })

    it('partially tracked frame chain [0-2-1-(2)?]', () => {
      return partiallyTrackedFrameChain1()
    })

    it('partially tracked frame chain [(0-2)?-1-2]', () => {
      return partiallyTrackedFrameChain2()
    })

    it('tracked frame chain [0-2-1-2]', () => {
      return trackedFrameChain()
    })
  })

  async function untrackedFrameChainSameOrigin() {
    const frameElements = [null] as any[]
    const frameElement = await mock.findElement('frame0')
    frameElements.push(frameElement)
    await mock.switchToFrame(frameElement)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function untrackedCorsFrameChain() {
    const frameElements = [null] as any[]
    const frameElement1 = await mock.findElement('frame1')
    frameElements.push(frameElement1)
    await mock.switchToFrame(frameElement1)
    const frameElement2 = await mock.findElement('frame1-2')
    frameElements.push(frameElement2)
    await mock.switchToFrame(frameElement2)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function untrackedMixedFrameChain1() {
    const frameElements = [null] as any[]
    const frameElement1 = await mock.findElement('frame1')
    frameElements.push(frameElement1)
    await mock.switchToFrame(frameElement1)
    const frameElement0 = await mock.findElement('frame1-0')
    frameElements.push(frameElement0)
    await mock.switchToFrame(frameElement0)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function untrackedMixedFrameChain2() {
    const frameElements = [null] as any[]
    const frameElement1 = await mock.findElement('frame1')
    frameElements.push(frameElement1)
    await mock.switchToFrame(frameElement1)
    const frameElement11 = await mock.findElement('frame1-1')
    frameElements.push(frameElement11)
    await mock.switchToFrame(frameElement11)
    assert.strictEqual(driver.mainContext, driver.currentContext)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function partiallyTrackedFrameChain1() {
    const frameElements = [null] as any[]
    const frameElement2 = await mock.findElement('frame2')
    frameElements.push(frameElement2)
    await driver.switchToChildContext(frameElement2)
    const frameElement1 = await mock.findElement('frame2-1')
    frameElements.push(frameElement1)
    await driver.switchToChildContext(frameElement1)
    const frameElement22 = await mock.findElement('frame2-1-2')
    frameElements.push(frameElement22)
    await mock.switchToFrame(frameElement22)
    assert.strictEqual(driver.currentContext.path.length, 3)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function partiallyTrackedFrameChain2() {
    const frameElements = [null] as any[]
    const frameElement2 = await mock.findElement('frame2')
    frameElements.push(frameElement2)
    await mock.switchToFrame(frameElement2)
    const frameElement1 = await mock.findElement('frame2-1')
    frameElements.push(frameElement1)
    await driver.switchToChildContext(frameElement1)
    const frameElement22 = await mock.findElement('frame2-1-2')
    frameElements.push(frameElement22)
    await driver.switchToChildContext(frameElement22)
    assert.strictEqual(driver.currentContext.path.length, 3)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }

  async function trackedFrameChain() {
    const frameElements = [null] as any[]
    const frameElement2 = await mock.findElement('frame2')
    frameElements.push(frameElement2)
    await driver.switchToChildContext(frameElement2)
    const frameElement1 = await mock.findElement('frame2-1')
    frameElements.push(frameElement1)
    await driver.switchToChildContext(frameElement1)
    const frameElement22 = await mock.findElement('frame2-1-2')
    frameElements.push(frameElement22)
    await driver.switchToChildContext(frameElement22)
    assert.strictEqual(driver.currentContext.path.length, frameElements.length)
    await driver.refresh({reset: true})
    const contextPath = driver.currentContext.path
    assert.strictEqual(contextPath.length, frameElements.length)
    for (const frameIndex of frameElements.keys()) {
      assert.ok(await contextPath[frameIndex].equals(frameElements[frameIndex]))
    }
  }
})

describe('driver native', () => {
  let driver: Driver<any>

  before(async () => {
    driver = new Driver({logger, spec, driver: new MockDriver({device: {isNative: true}})})
  })

  it('from driver info', async () => {
    const driver = new Driver({
      logger,
      spec,
      driver: new MockDriver({
        device: {isNative: true, name: 'MobilePhone'},
        platform: {name: 'OS', version: 'V'},
      }),
    })

    const environment = await driver.getEnvironment()
    assert.strictEqual(environment.deviceName, 'MobilePhone')
    assert.strictEqual(environment.platformName, 'OS')
    assert.strictEqual(environment.platformVersion, 'V')
    assert.strictEqual(environment.browserName, null)
    assert.strictEqual(environment.browserVersion, null)
  })

  it('from no info', async () => {
    const driver = new Driver({
      logger,
      spec,
      driver: new MockDriver({device: {isNative: true}}),
    })

    const environment = await driver.getEnvironment()
    assert.strictEqual(environment.deviceName, undefined)
    assert.strictEqual(environment.platformName, null)
    assert.strictEqual(environment.platformVersion, null)
    assert.strictEqual(environment.browserName, null)
    assert.strictEqual(environment.browserVersion, null)
  })

  it('skip unnecessary method calls on native mode', async () => {
    const title = await driver.getTitle()
    const url = await driver.getUrl()
    assert.strictEqual(title, undefined)
    assert.strictEqual(url, undefined)
  })

  it('should return correct viewport size', async () => {
    assert.deepStrictEqual(await driver.getViewportSize(), {width: 1000, height: 1000})
  })

  describe('with nml lib', () => {
    let driver: Driver<any>, mock: MockDriver

    beforeEach(async () => {
      mock = new MockDriver({device: {isNative: true, name: 'MobilePhone'}})
      driver = new Driver({logger, spec, driver: mock})
    })

    it('should extract broker url', async () => {
      mock.mockElement('Applitools_View', {attrs: {text: '{"error":"","nextPath":"http://blah"}'}})
      assert.deepStrictEqual(await driver.extractBrokerUrl(), 'http://blah')
    })

    it('should retry when extract broker url', async () => {
      let count = 0
      mock.mockElement('Applitools_View', {
        attrs: {
          get text() {
            return ++count < 3 ? '{"error":"","nextPath":null}' : '{"error":"","nextPath":"http://blah"}'
          },
        },
      })

      assert.deepStrictEqual(await driver.extractBrokerUrl(), 'http://blah')
    })

    it('should cache nml element', async () => {
      const element = mock.mockElement('Applitools_View', {
        attrs: {
          count: 0,
          get text() {
            return `{"error":"","nextPath":"http://blah${++this.count}"}`
          },
        },
      })
      assert.deepStrictEqual(await driver.extractBrokerUrl(), 'http://blah1')
      mock.unmockElement(element)
      assert.deepStrictEqual(await driver.extractBrokerUrl(), 'http://blah2')
    })

    it('should re-find nml element if text extraction failed', async () => {
      const element = mock.mockElement('Applitools_View', {
        attrs: {
          used: false,
          get text(): string {
            if (this.used) {
              this.used = false
              throw new Error('It was already used')
            }
            this.used = false
            return `{"error":"","nextPath":"http://blah"}`
          },
        },
      })
      assert.deepStrictEqual(await driver.extractBrokerUrl(), 'http://blah')
      mock.unmockElement(element)
      assert.deepStrictEqual(await driver.extractBrokerUrl(), 'http://blah')
    })
  })
})

describe('driver mobile', () => {
  it('from driver info', async () => {
    const driver: Driver<any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: null,
        device: {isMobile: true, name: 'MobilePhone'},
        platform: {name: 'OS', version: 'V'},
        browser: {name: 'Browser', version: '3'},
      }),
    })

    const environment = await driver.getEnvironment()
    assert.deepStrictEqual(environment, {
      deviceName: 'MobilePhone',
      platformName: 'OS',
      platformVersion: 'V',
      browserName: 'Browser',
      browserVersion: '3',
      isMobile: true,
      isNative: false,
      isWeb: true,
      isEC: false,
      isChrome: false,
      isChromium: false,
      isEdge: false,
      isEdgeLegacy: false,
      isIE: false,
      isAndroid: false,
      isIOS: false,
      isMac: false,
      isWindows: false,
    })
  })

  it('from ua info', async () => {
    const driver: Driver<any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        device: {isMobile: true, name: 'iPhone'},
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
      }),
    })

    const environment = await driver.getEnvironment()
    assert.deepStrictEqual(environment, {
      platformName: 'iOS',
      platformVersion: '12.3',
      browserName: 'Safari',
      browserVersion: '12.1',
      deviceName: 'iPhone',
      isAndroid: false,
      isChrome: false,
      isChromium: false,
      isEC: false,
      isEdge: false,
      isEdgeLegacy: false,
      isIE: false,
      isIOS: true,
      isMac: false,
      isMobile: true,
      isNative: false,
      isWeb: true,
      isWindows: false,
      isReliable: false,
    })
  })

  it('from driver info and ua info', async () => {
    const driver: Driver<any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        device: {isMobile: true, name: 'MobilePhone'},
        platform: {name: 'CorrectOS', version: 'X'},
        browser: {name: 'WrongBrowser', version: '0'},
      }),
    })

    const environment = await driver.getEnvironment()
    assert.deepStrictEqual(environment, {
      deviceName: 'MobilePhone',
      platformName: 'CorrectOS',
      platformVersion: 'X',
      browserName: 'Safari',
      browserVersion: '12.1',
      isAndroid: false,
      isChrome: false,
      isChromium: false,
      isEC: false,
      isEdge: false,
      isEdgeLegacy: false,
      isIE: false,
      isIOS: false,
      isMac: false,
      isMobile: true,
      isNative: false,
      isWeb: true,
      isWindows: false,
      isReliable: false,
    })
  })

  it('should work with lower case platformName: ios', async () => {
    const driver: Driver<any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        device: {isMobile: true, name: 'MobilePhone'},
        platform: {name: 'ios', version: '14.0'},
        browser: {name: 'safari', version: '0'},
      }),
    })

    const environment = await driver.getEnvironment()
    assert.equal(environment.isIOS, true)
  })

  it('should work with lower case platformName: android', async () => {
    const driver: Driver<any> = await new Driver({
      logger,
      spec,
      driver: new MockDriver({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/15E148 Safari/604.1',
        device: {isMobile: true, name: 'MobilePhone'},
        platform: {name: 'android', version: '12.0'},
        browser: {name: 'chrome', version: '0'},
      }),
    })

    const environment = await driver.getEnvironment()
    assert.equal(environment.isAndroid, true)
  })
})
