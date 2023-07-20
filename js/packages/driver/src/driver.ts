import type {Size, Region} from '@applitools/utils'
import type {
  DriverInfo,
  Capabilities,
  UserAgent,
  Environment,
  Viewport,
  Features,
  ScreenOrientation,
  Cookie,
} from './types'
import {type Selector} from './selector'
import {type SpecType, type SpecDriver, type WaitOptions} from './spec-driver'
import {type Element} from './element'
import {Context, type ContextReference} from './context'
import {makeLogger, type Logger} from '@applitools/logger'
import {HelperIOS} from './helper-ios'
import {HelperAndroid} from './helper-android'
import {extractUserAgentEnvironment} from './user-agent'
import {extractCapabilitiesEnvironment, extractCapabilitiesViewport} from './capabilities'
import * as specUtils from './spec-utils'
import * as utils from '@applitools/utils'

const snippets = require('@applitools/snippets')

type DriverState<T extends SpecType> = {
  nmlElement?: Element<T> | null
}

type DriverOptions<T extends SpecType> = {
  spec: SpecDriver<T>
  driver: T['driver']
  logger?: Logger
  customConfig?: {useCeilForViewportSize?: boolean}
}

export class Driver<T extends SpecType> {
  private _target: T['driver']

  private _guid: string
  private _mainContext: Context<T>
  private _currentContext: Context<T>
  private _driverInfo?: DriverInfo
  private _environment?: Environment
  private _viewport?: Viewport
  private _features?: Features
  private _helper?: HelperAndroid<T> | HelperIOS<T> | null
  private _state: DriverState<T> = {}
  private _customConfig: {useCeilForViewportSize?: boolean} = {}
  private _logger: Logger

  protected readonly _spec: SpecDriver<T>

  protected readonly _original = this

  constructor(options: DriverOptions<T>) {
    this._logger = makeLogger({logger: options.logger, format: {label: 'driver'}})
    this._customConfig = options.customConfig ?? {}
    this._guid = utils.general.guid()
    this._spec = options.spec
    this._target = this._spec.transformDriver?.(options.driver) ?? options.driver

    if (!this._spec.isDriver(this._target)) {
      throw new TypeError('Driver constructor called with argument of unknown type!')
    }

    this._mainContext = new Context({
      spec: this._spec,
      context: this._spec.extractContext?.(this._target) ?? (this._target as T['context']),
      driver: this,
    })
    this._currentContext = this._mainContext
  }

  get logger() {
    return this._logger
  }

  get target(): T['driver'] {
    return this._target
  }
  get guid() {
    return this._guid
  }
  get currentContext(): Context<T> {
    return this._currentContext
  }
  get mainContext(): Context<T> {
    return this._mainContext
  }

  updateLogger(logger: Logger): void {
    this._logger = logger.extend({label: 'driver'})
  }

  updateCurrentContext(context: Context<T>): void {
    this._currentContext = context
  }

  async reloadPage(): Promise<this> {
    await this.mainContext.execute(snippets.reloadPage).catch(() => null)
    return this.refresh({reset: false})
  }

  async refresh({reset}: {reset?: boolean} = {}): Promise<this> {
    if (reset) {
      this._driverInfo = undefined
      this._environment = undefined
      this._viewport = undefined
      this._features = undefined
      this._helper = undefined
      this._state = {}
    }

    const spec = this._spec

    let currentContext = this.currentContext.target
    let contextInfo
    try {
      contextInfo = await getContextInfo(currentContext)
    } catch (err) {
      return reset ? (resetReference(this) as this) : this
    }

    const path = []
    if (spec.parentContext) {
      while (!contextInfo.isRoot) {
        currentContext = await spec.parentContext(currentContext)
        const contextReference = await findContextReference(currentContext, contextInfo)
        if (!contextReference) throw new Error('Unable to find out the chain of frames')
        path.unshift(contextReference)
        contextInfo = await getContextInfo(currentContext)
      }
    } else {
      currentContext = await spec.mainContext(currentContext)
      path.push(...(await findContextPath(currentContext, contextInfo))!)
    }
    this._currentContext = this._mainContext
    await this.switchToChildContext(...path)
    return reset ? (resetReference(this) as this) : this

    function resetReference(driver: Driver<T>): Driver<T> {
      return new Proxy(driver._original, {
        get(driver, key, receiver) {
          if (key === '_original') return driver
          return Reflect.get(driver, key, receiver)
        },
      })
    }

    function transformSelector(selector: Selector<T>) {
      return specUtils.transformSelector(spec, selector, {isWeb: true})
    }

    async function getContextInfo(context: T['context']): Promise<any> {
      const [documentElement, selector, isRoot, isCORS] = await spec.executeScript(context, snippets.getContextInfo)
      return {documentElement, selector, isRoot, isCORS}
    }

    async function getChildContextsInfo(context: T['context']): Promise<any[]> {
      const framesInfo = await spec.executeScript(context, snippets.getChildFramesInfo)
      return framesInfo.map(([contextElement, isCORS]: [T['element'], boolean]) => ({
        contextElement,
        isCORS,
      }))
    }

    async function isEqualElements(
      context: T['context'],
      element1: T['element'],
      element2: T['element'],
    ): Promise<boolean> {
      return spec.executeScript(context, snippets.isEqualElements, [element1, element2]).catch(() => false)
    }

    async function findContextReference(context: T['context'], contextInfo: any): Promise<T['element'] | null> {
      if (contextInfo.selector) {
        const contextElement = await spec.findElement(
          context,
          transformSelector({type: 'xpath', selector: contextInfo.selector}),
        )
        if (contextElement) return contextElement
      }
      for (const childContextInfo of await getChildContextsInfo(context)) {
        if (childContextInfo.isCORS !== contextInfo.isCORS) continue
        const childContext = await spec.childContext(context, childContextInfo.contextElement)
        const contentDocument = await spec.findElement(childContext, transformSelector('html'))
        const isWantedContext = await isEqualElements(childContext, contentDocument!, contextInfo.documentElement)
        await spec.parentContext!(childContext)
        if (isWantedContext) return childContextInfo.contextElement
      }
      return null
    }

    async function findContextPath(
      context: T['context'],
      contextInfo: any,
      contextPath: T['element'][] = [],
    ): Promise<T['element'][] | undefined> {
      const contentDocument = await spec.findElement(context, transformSelector('html'))
      if (await isEqualElements(context, contentDocument!, contextInfo.documentElement)) {
        return contextPath
      }
      for (const childContextInfo of await getChildContextsInfo(context)) {
        const childContext = await spec.childContext(context, childContextInfo.contextElement)
        const possibleContextPath = [...contextPath, childContextInfo.contextElement]
        const wantedContextPath = await findContextPath(childContext, contextInfo, possibleContextPath)
        await spec.mainContext(context)

        if (wantedContextPath) return wantedContextPath

        for (const contextElement of contextPath) {
          await spec.childContext(context, contextElement)
        }
      }
    }
  }

  async getDriverInfo({force}: {force?: boolean} = {}): Promise<DriverInfo> {
    if (!this._driverInfo || force) {
      this._driverInfo = (await this._spec.getDriverInfo?.(this.target)) ?? {}
      this._logger.log('Extracted driver info', this._driverInfo)
    }
    return this._driverInfo
  }

  async getCapabilities({force}: {force?: boolean} = {}): Promise<Capabilities | null> {
    if (this._driverInfo?.capabilities === undefined || force) {
      this._driverInfo ??= {}
      await this._spec.getCapabilities?.(this.target)
      this._driverInfo.capabilities = (await this._spec.getCapabilities?.(this.target)) ?? null
      this._logger.log('Extracted driver capabilities', this._driverInfo.capabilities)
    }
    return this._driverInfo.capabilities
  }

  async getUserAgent({force}: {force?: boolean} = {}): Promise<UserAgent | undefined> {
    if (this._driverInfo?.userAgent === undefined || force) {
      this._driverInfo ??= {}
      this._driverInfo.userAgent ??=
        (await this.currentContext.executePoll(snippets.getUserAgent, {
          main: undefined,
          poll: undefined,
          pollTimeout: 100,
        })) ?? null
      this._logger.log('Extracted user agent', this._driverInfo.userAgent)
    }
    return this._driverInfo.userAgent ?? undefined
  }

  async getUserAgentLegacy({force}: {force?: boolean} = {}): Promise<string | undefined> {
    const userAgent = await this.getUserAgent({force})
    return utils.types.isObject(userAgent) ? userAgent?.legacy : userAgent
  }

  async getEnvironment(): Promise<Environment> {
    if (!this._environment) {
      const driverInfo = await this.getDriverInfo()
      this._environment = {...driverInfo.environment}

      const capabilities = await this.getCapabilities()
      const capabilitiesEnvironment = capabilities ? extractCapabilitiesEnvironment(capabilities) : null
      this._logger.log('Extracted capabilities environment', capabilitiesEnvironment)
      this._environment = {...this._environment, ...capabilitiesEnvironment}

      if (this._environment.isMobile && !this._environment.browserName) {
        const world = await this.getCurrentWorld()
        if (!!world?.includes('WEBVIEW')) {
          this._environment.isNative = true
          this._environment.isWeb = true
        }
      }

      this._environment.isWeb ??= !this._environment.isNative

      if (this._environment.isWeb) {
        const userAgent = await this.getUserAgent()
        const userAgentEnvironment = userAgent ? extractUserAgentEnvironment(userAgent) : null
        this._logger.log('Extracted user agent environment', userAgentEnvironment)
        this._environment = {
          ...this._environment,
          ...userAgentEnvironment,
          // NOTE: not really necessary, but some user agents for mobile devices (iPads) may return a wrong platform info
          ...(this._environment.isMobile
            ? {
                platformName: this._environment.platformName ?? userAgentEnvironment?.platformName,
                platformVersion: this._environment.platformVersion ?? userAgentEnvironment?.platformVersion,
              }
            : {}),
        }
      }

      if (this._environment.browserName) {
        this._environment.isIE = /(internet explorer|ie)/i.test(this._environment.browserName)
        this._environment.isEdge =
          /edge/i.test(this._environment.browserName) && Number.parseInt(this._environment.browserVersion!) >= 79
        this._environment.isEdgeLegacy =
          /edge/i.test(this._environment.browserName) && Number.parseInt(this._environment.browserVersion!) < 79
        this._environment.isChrome = /chrome/i.test(this._environment.browserName)
        this._environment.isChromium = this._environment.isChrome || this._environment.isEdge
      }

      if (this._environment.platformName) {
        this._environment.isWindows = /Windows/i.test(this._environment.platformName)
        this._environment.isMac = /mac\s?OS/i.test(this._environment.platformName)
        this._environment.isAndroid = /Android/i.test(this._environment.platformName)
        this._environment.isIOS = /iOS/i.test(this._environment.platformName)
      }

      if (
        (this._environment.isAndroid || this._environment.isIOS) &&
        this._environment.isWeb &&
        !this._environment.isMobile
      ) {
        this._environment.isMobile = true
        this._environment.isEmulation = true
      }

      this._environment.isEC =
        this._environment.isECClient || /exec-wus.applitools.com/.test((await this.getDriverUrl()) ?? '')

      this._logger.log('Extracted environment', this._environment)
    }
    return this._environment
  }

  async getViewport(): Promise<Viewport> {
    if (!this._viewport) {
      const environment = await this.getEnvironment()

      const driverInfo = await this.getDriverInfo()
      this._viewport = {...(driverInfo.viewport as Viewport)}

      if (environment.isMobile) {
        if (!this._viewport.orientation) {
          const orientation = await this.getOrientation()
          if (orientation) this._viewport.orientation = orientation
        }
      }

      if (environment.isNative) {
        const capabilities = await this.getCapabilities()
        const capabilitiesViewport = capabilities ? extractCapabilitiesViewport(capabilities) : null
        this._logger.log('Extracted capabilities viewport', capabilitiesViewport)
        this._viewport = {...capabilitiesViewport, ...this._viewport}

        this._viewport.pixelRatio ??= 1

        // this value always excludes the height of the navigation bar, and sometimes it also excludes the height of the status bar
        let windowSize = await this._spec.getWindowSize!(this.target)
        this._viewport.displaySize ??= windowSize

        if (
          this._viewport.orientation?.startsWith('landscape') &&
          this._viewport.displaySize.height > this._viewport.displaySize.width
        ) {
          this._viewport.displaySize = utils.geometry.rotate(this._viewport.displaySize, 90)
        }

        if (environment.isAndroid) {
          // bar sizes could be extracted only on android
          const {statusBar, navigationBar} =
            (await this._spec.getSystemBars?.(this.target).catch(() => undefined)) ?? {}

          if (statusBar?.visible) {
            this._logger.log('Driver status bar', statusBar)

            const statusBarSize = statusBar.height

            // when status bar is overlapping content on android it returns status bar height equal to display height
            if (statusBarSize < this._viewport.displaySize.height) {
              this._viewport.statusBarSize = Math.max(this._viewport.statusBarSize ?? 0, statusBarSize)
            }
          }
          if (navigationBar?.visible) {
            this._logger.log('Driver navigation size', navigationBar)

            // if navigation bar is placed on the right side is screen the the orientation is landscape-secondary
            if (navigationBar.x > 0) this._viewport.orientation = 'landscape-secondary'

            // navigation bar size could be its height or width depending on screen orientation
            const navigationBarSize =
              navigationBar[this._viewport.orientation?.startsWith('landscape') ? 'width' : 'height']

            // when navigation bar is invisible on android it returns navigation bar size equal to display size
            if (
              navigationBarSize <
              this._viewport.displaySize[this._viewport.orientation?.startsWith('landscape') ? 'width' : 'height']
            ) {
              this._viewport.navigationBarSize = Math.max(this._viewport.navigationBarSize ?? 0, navigationBarSize)
            } else {
              this._viewport.navigationBarSize = 0
            }
          }

          // bar sizes have to be scaled on android
          this._viewport.statusBarSize &&= this._viewport.statusBarSize / this._viewport.pixelRatio
          this._viewport.navigationBarSize &&= this._viewport.navigationBarSize / this._viewport.pixelRatio

          windowSize = utils.geometry.scale(windowSize, 1 / this._viewport.pixelRatio)
          this._viewport.displaySize &&= utils.geometry.scale(this._viewport.displaySize, 1 / this._viewport.pixelRatio)

          this._viewport.navigationBarSize ??= 0
        } else if (environment.isIOS) {
          if (this._viewport.orientation?.startsWith('landscape')) this._viewport.statusBarSize = 0
        }

        this._viewport.statusBarSize ??= 0

        // calculate viewport location
        this._viewport.viewportLocation ??= {
          x: this._viewport.orientation === 'landscape' ? this._viewport.navigationBarSize ?? 0 : 0,
          y: this._viewport.statusBarSize!,
        }

        // calculate viewport size
        if (!this._viewport.viewportSize) {
          this._viewport.viewportSize = {...this._viewport.displaySize}
          this._viewport.viewportSize.height -= this._viewport.statusBarSize!
          if (environment.isAndroid) {
            this._viewport.viewportSize[this._viewport.orientation?.startsWith('landscape') ? 'width' : 'height'] -=
              this._viewport.navigationBarSize!
          }
        }

        // calculate safe area
        if (!environment.isWeb && environment.isIOS && !this._viewport.safeArea) {
          this._viewport.safeArea = {x: 0, y: 0, ...this._viewport.displaySize}
          const topElement = await this.element({
            type: '-ios class chain',
            selector: '**/XCUIElementTypeNavigationBar',
          })
          if (topElement) {
            const topRegion = await this._spec.getElementRegion!(this.target, topElement.target)
            const topOffset = topRegion.y + topRegion.height
            this._viewport.safeArea.y = topOffset
            this._viewport.safeArea.height -= topOffset
          }
          const bottomElement = await this.element({
            type: '-ios class chain',
            selector: '**/XCUIElementTypeTabBar',
          })
          if (bottomElement) {
            const bottomRegion = await this._spec.getElementRegion!(this.target, bottomElement.target)
            const bottomOffset = bottomRegion.height
            this._viewport.safeArea.height -= bottomOffset
          }
        }
      }

      if (environment.isWeb) {
        const browserViewport: Viewport = await this.execute(snippets.getViewport)
        this._viewport.viewportSize ??= browserViewport.viewportSize
        this._viewport.pixelRatio ??= browserViewport.pixelRatio
        this._viewport.viewportScale ??= browserViewport.viewportScale
        this._viewport.orientation ??= browserViewport.orientation
      }

      this._viewport.pixelRatio ??= 1
      this._viewport.viewportScale ??= 1

      this._logger.log('Extracted viewport', this._viewport)
    }

    return this._viewport
  }

  async getFeatures(): Promise<Features> {
    if (!this._features) {
      const driverInfo = await this.getDriverInfo()
      this._features = {...driverInfo.features}
      const environment = await this.getEnvironment()
      this._features.allCookies ??= environment.isChromium || !environment.isMobile
      this._logger.log('Extracted driver features', this._features)
    }
    return this._features
  }

  async getSessionId(): Promise<string | null> {
    const driverInfo = await this.getDriverInfo()
    return driverInfo.sessionId ?? null
  }

  async getDriverUrl(): Promise<string | null> {
    const driverInfo = await this.getDriverInfo()
    return driverInfo.remoteHostname ?? null
  }

  async getHelper(): Promise<HelperAndroid<T> | HelperIOS<T> | null> {
    if (this._helper === undefined) {
      const environment = await this.getEnvironment()
      this._logger.log(`Extracting helper for ${environment.isIOS ? 'ios' : 'android'}`)
      this._helper = environment.isIOS
        ? await HelperIOS.make({spec: this._spec, driver: this})
        : await HelperAndroid.make({spec: this._spec, driver: this})
      this._logger.log(`Extracted helper of type ${this._helper?.name}`)
    }
    this._logger.log(`Returning helper for of type ${this._helper?.name ?? null}`)
    return this._helper
  }

  async extractBrokerUrl(): Promise<string | null> {
    const environment = await this.getEnvironment()
    if (!environment.isNative) return null
    this._logger.log('Broker url extraction is started')
    this._state.nmlElement ??= await this.waitFor(
      {type: 'accessibility id', selector: 'Applitools_View'},
      {timeout: 10_000},
    ).catch(() => null)
    if (!this._state.nmlElement) {
      this._logger.log('Broker url extraction is failed due to absence of nml element')
      return null
    }
    try {
      let result: {error: string; nextPath: string | null}
      do {
        result = JSON.parse(await this._state.nmlElement.getText())
        if (result.nextPath) {
          this._logger.log('Broker url was extraction finished successfully with value', result.nextPath)
          return result.nextPath
        }
        await utils.general.sleep(1000)
      } while (!result.error)
      this._logger.error('Broker url extraction has failed with error', result.error)
      return null
    } catch (error) {
      this._logger.error('Broker url extraction has failed with error and will be retried', error)
      this._state.nmlElement = null
      return this.extractBrokerUrl()
    }
  }

  async getSessionMetadata(): Promise<any | undefined> {
    try {
      const metadata = await this.currentContext.execute('applitools:metadata')
      this._logger.log('Extracted session metadata', metadata)
      return metadata
    } catch (err) {
      this._logger.warn('Failed to extract session metadata due to the error', err)
    }
  }

  async getWorlds(): Promise<string[] | null> {
    if (!this._spec.getWorlds) return null
    this._logger.log('Extracting worlds')
    try {
      let worlds = [] as string[]
      for (let attempt = 0; worlds.length <= 1 && attempt < 3; ++attempt) {
        if (attempt > 0) await utils.general.sleep(500)
        worlds = await this._spec.getWorlds(this.target)
      }
      this._logger.log('Worlds were extracted', worlds)
      return worlds
    } catch (error) {
      this._logger.warn('Worlds were not extracted due to the error', error)
      return null
    }
  }

  async getCurrentWorld(): Promise<string | null> {
    if (!this._spec.getCurrentWorld) return null
    try {
      this._logger.log('Extracting current world')
      const current = await this._spec.getCurrentWorld(this.target)
      this._logger.log('Current world was extracted', current)
      return current
    } catch (error) {
      this._logger.warn('Current world was not extracted due to the error', error)
      return null
    }
  }

  async switchWorld(name?: string): Promise<void> {
    name ??= 'NATIVE_APP'
    this._logger.log('Switching world to', name)
    if (!this._spec.switchWorld) {
      this._logger.error('Unable to switch world due to missed implementation')
      throw new Error('Unable to switch world due to missed implementation')
    }
    try {
      await this._spec.switchWorld(this.target, name)
      this.refresh({reset: true})
    } catch (error: any) {
      this._logger.error('Unable to switch world due to the error', error)
      throw new Error(`Unable to switch world, the original error was: ${error.message}`)
    }
  }

  async switchTo(context: Context<T>): Promise<Context<T>> {
    if (await this.currentContext.equals(context)) {
      return (this._currentContext = context)
    }
    const currentPath = this.currentContext.path
    const requiredPath = context.path

    let diffIndex = -1
    for (const [index, context] of requiredPath.entries()) {
      if (currentPath[index] && !(await currentPath[index].equals(context))) {
        diffIndex = index
        break
      }
    }

    if (diffIndex === 0) {
      throw new Error('Cannot switch to the context, because it has different main context')
    } else if (diffIndex === -1) {
      if (currentPath.length === requiredPath.length) {
        // required and current paths are the same
        return this.currentContext
      } else if (requiredPath.length > currentPath.length) {
        // current path is a sub-path of required path
        return this.switchToChildContext(...requiredPath.slice(currentPath.length))
      } else if (currentPath.length - requiredPath.length <= requiredPath.length) {
        // required path is a sub-path of current path
        return this.switchToParentContext(currentPath.length - requiredPath.length)
      } else {
        // required path is a sub-path of current path
        await this.switchToMainContext()
        return this.switchToChildContext(...requiredPath)
      }
    } else if (currentPath.length - diffIndex <= diffIndex) {
      // required path is different from current or they are partially intersected
      // chose an optimal way to traverse from current context to target context
      await this.switchToParentContext(currentPath.length - diffIndex)
      return this.switchToChildContext(...requiredPath.slice(diffIndex))
    } else {
      await this.switchToMainContext()
      return this.switchToChildContext(...requiredPath)
    }
  }

  async switchToMainContext(): Promise<Context<T>> {
    const environment = await this.getEnvironment()
    if (!environment.isWeb) throw new Error('Contexts are supported only for web drivers')

    this._logger.log('Switching to the main context')
    await this._spec.mainContext(this.currentContext.target)
    return (this._currentContext = this._mainContext)
  }

  async switchToParentContext(elevation = 1): Promise<Context<T>> {
    const environment = await this.getEnvironment()
    if (!environment.isWeb) throw new Error('Contexts are supported only for web drivers')

    this._logger.log('Switching to a parent context with elevation:', elevation)
    if (this.currentContext.path.length <= elevation) {
      return this.switchToMainContext()
    }

    try {
      while (elevation > 0) {
        await this._spec.parentContext!(this.currentContext.target)
        this._currentContext = this._currentContext.parent!
        elevation -= 1
      }
    } catch (err) {
      this._logger.warn('Unable to switch to a parent context due to error', err)
      this._logger.log('Applying workaround to switch to the parent frame')
      const path = this.currentContext.path.slice(1, -elevation)
      await this.switchToMainContext()
      await this.switchToChildContext(...path)
      elevation = 0
    }
    return this.currentContext
  }

  async switchToChildContext(...references: ContextReference<T>[]): Promise<Context<T>> {
    const environment = await this.getEnvironment()
    if (!environment.isWeb) throw new Error('Contexts are supported only for web drivers')
    this._logger.log('Switching to a child context with depth:', references.length)
    for (const reference of references) {
      if (reference === this.mainContext) continue
      const context = await this.currentContext.context(reference)
      await context.focus()
    }
    return this.currentContext
  }

  async normalizeRegion(region: Region): Promise<Region> {
    const environment = await this.getEnvironment()
    if (environment.isWeb) return region

    const viewport = await this.getViewport()

    let normalizedRegion = region
    if (environment.isAndroid) {
      normalizedRegion = utils.geometry.scale(normalizedRegion, 1 / viewport.pixelRatio)
    }
    if (environment.isIOS && viewport.safeArea && utils.geometry.isIntersected(normalizedRegion, viewport.safeArea)) {
      normalizedRegion = utils.geometry.intersect(normalizedRegion, viewport.safeArea)
    }
    if (viewport.viewportLocation) {
      normalizedRegion = utils.geometry.offsetNegative(normalizedRegion, viewport.viewportLocation)
    }
    if (normalizedRegion.y < 0) {
      normalizedRegion.height += normalizedRegion.y
      normalizedRegion.y = 0
    }
    return normalizedRegion
  }

  async getRegionInViewport(context: Context<T>, region: Region): Promise<Region> {
    await context.focus()
    return context.getRegionInViewport(region)
  }

  async takeScreenshot(): Promise<Buffer> {
    const image = await this._spec.takeScreenshot(this.target)
    if (utils.types.isString(image)) {
      return Buffer.from(image.replace(/[\r\n]+/g, ''), 'base64')
    }
    return image
  }

  async getViewportSize(): Promise<Size> {
    const environment = await this.getEnvironment()

    let size
    if (environment.isNative && !environment.isWeb) {
      const viewport = await this.getViewport()
      if (viewport.viewportSize) {
        this._logger.log('Extracting viewport size from native driver using cached value')
        size = viewport.viewportSize
      } else {
        this._logger.log('Extracting viewport size from native driver')
        size = (await this.getDisplaySize())!
        size.height -= viewport.statusBarSize ?? 0
      }
      this._logger.log(`Rounding viewport size using`, this._customConfig.useCeilForViewportSize ? 'ceil' : 'round')
      if (this._customConfig.useCeilForViewportSize) {
        size = utils.geometry.ceil(size)
      } else {
        size = utils.geometry.round(size)
      }
    } else if (this._spec.getViewportSize) {
      this._logger.log('Extracting viewport size from web driver using spec method')
      size = await this._spec.getViewportSize(this.target)
    } else {
      this._logger.log('Extracting viewport size from web driver using js snippet')
      const viewport = await this.mainContext.execute(snippets.getViewport)
      size = viewport.viewportSize
    }

    this._logger.log('Extracted viewport size', size)

    return size
  }

  async setViewportSize(size: Size): Promise<void> {
    const environment = await this.getEnvironment()
    if (environment.isMobile && !environment.isEmulation) return
    if (this._spec.setViewportSize) {
      this._logger.log('Setting viewport size to', size, 'using spec method')
      await this._spec.setViewportSize(this.target, size)
      return
    }

    this._logger.log('Setting viewport size to', size, 'using workaround')

    const requiredViewportSize = size
    let currentViewportSize = await this.getViewportSize()
    if (utils.geometry.equals(currentViewportSize, requiredViewportSize)) return

    let currentWindowSize = await this._spec.getWindowSize!(this.target)
    this._logger.log('Extracted window size', currentWindowSize)

    let attempt = 0
    while (attempt++ < 3) {
      const requiredWindowSize = {
        width: Math.max(0, currentWindowSize.width + (requiredViewportSize.width - currentViewportSize.width)),
        height: Math.max(0, currentWindowSize.height + (requiredViewportSize.height - currentViewportSize.height)),
      }
      this._logger.log(`Attempt #${attempt} to set viewport size by setting window size to`, requiredWindowSize)
      await this._spec.setWindowSize!(this.target, requiredWindowSize)

      const prevViewportSize = currentViewportSize
      currentViewportSize = await this.getViewportSize()
      if (utils.geometry.equals(currentViewportSize, prevViewportSize)) {
        currentViewportSize = await this.getViewportSize()
      }
      currentWindowSize = requiredWindowSize
      if (utils.geometry.equals(currentViewportSize, requiredViewportSize)) return
      this._logger.log(`Attempt #${attempt} to set viewport size failed. Current viewport:`, currentViewportSize)
    }

    throw new Error('Failed to set viewport size!')
  }

  async getDisplaySize(): Promise<Size | undefined> {
    const environment = await this.getEnvironment()
    if (!environment.isNative) return undefined

    const viewport = await this.getViewport()
    if (viewport?.displaySize) {
      this._logger.log('Extracting display size from native driver using cached value', viewport.displaySize)
      return viewport.displaySize
    }
    let size = await this._spec.getWindowSize!(this.target)
    if ((await this.getOrientation())?.startsWith('landscape') && size.height > size.width) {
      size = {width: size.height, height: size.width}
    }
    const normalizedSize = environment.isAndroid ? utils.geometry.scale(size, 1 / viewport.pixelRatio) : size
    this._logger.log('Extracted and normalized display size:', normalizedSize)
    return normalizedSize
  }

  async getOrientation(): Promise<ScreenOrientation | undefined> {
    const environment = await this.getEnvironment()
    if (!environment.isMobile) return undefined
    if (environment.isEmulation) return this._viewport?.orientation
    if (environment.isAndroid) {
      this._logger.log('Extracting device orientation using adb command on android')

      const rotation = await this.execute('mobile:shell', {
        command: "dumpsys window | grep 'mCurrentRotation' | cut -d = -f2",
      })
        .then(rotation => rotation?.trim?.())
        .catch(() => null)

      if (rotation) {
        let orientation: ScreenOrientation = undefined as never
        if (rotation === 'ROTATION_0' || rotation === '0') orientation = 'portrait'
        else if (rotation === 'ROTATION_90' || rotation === '3') orientation = 'landscape-secondary'
        else if (rotation === 'ROTATION_180' || rotation === '2') orientation = 'portrait-secondary'
        else if (rotation === 'ROTATION_270' || rotation === '1') orientation = 'landscape'
        this._logger.log('Extracted device orientation:', orientation)
        return orientation
      }
    }

    this._logger.log('Extracting device orientation')
    const orientation = await this._spec.getOrientation?.(this.target)
    this._logger.log('Extracted device orientation:', orientation)
    return orientation
  }

  async setOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
    const environment = await this.getEnvironment()
    if (!environment.isMobile) return undefined as never
    this._logger.log('Set device orientation:', orientation)
    await this._spec.setOrientation!(this.target, orientation)
  }

  async getCookies(): Promise<Cookie[]> {
    const environment = await this.getEnvironment()
    const features = await this.getFeatures()
    if (environment.isNative || !features.allCookies) return []
    try {
      const cookies = await this._spec.getCookies?.(this.target)
      this._logger.log('Extracted driver cookies', cookies)
      return cookies ?? []
    } catch (error) {
      this._logger.error('Error while extracting driver cookies', error)
      this._features ??= {}
      this._features.allCookies = false
      throw error
    }
  }

  async getTitle(): Promise<string> {
    const environment = await this.getEnvironment()
    if (environment.isNative) return undefined as never
    const title = await this._spec.getTitle(this.target)
    this._logger.log('Extracted title:', title)
    return title
  }

  async getUrl(): Promise<string> {
    const environment = await this.getEnvironment()
    if (environment.isNative) return undefined as never
    const url = await this._spec.getUrl(this.target)
    this._logger.log('Extracted url:', url)
    return url
  }

  async element(selector: Selector<T>): Promise<Element<T> | null> {
    return this.currentContext.element(selector)
  }

  async elements(selector: Selector<T>): Promise<Element<T>[]> {
    return this.currentContext.elements(selector)
  }

  async waitFor(selector: Selector<T>, options?: WaitOptions): Promise<Element<T> | null> {
    return this.currentContext.waitFor(selector, options)
  }

  async execute(script: ((arg: any) => any) | string, arg?: any): Promise<any> {
    return this.currentContext.execute(script, arg)
  }

  async visit(url: string): Promise<void> {
    await this._spec.visit?.(this.target, url)
  }
}

export function isDriver<T extends SpecType>(driver: any, spec?: SpecDriver<T>): driver is Driver<T> | T['driver'] {
  return driver instanceof Driver || !!spec?.isDriver(driver)
}

export async function makeDriver<T extends SpecType>(options: {
  driver: Driver<T> | T['driver']
  spec?: SpecDriver<T>
  customConfig?: {useCeilForViewportSize?: boolean}
  reset?: boolean
  logger?: Logger
}): Promise<Driver<T>> {
  const driver = options.driver instanceof Driver ? options.driver : new Driver(options as DriverOptions<T>)
  if (options.logger) driver.updateLogger(options.logger)
  return driver.refresh({reset: options.reset})
}
