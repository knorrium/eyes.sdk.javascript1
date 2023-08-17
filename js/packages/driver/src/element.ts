import type {Location, Size, Region} from '@applitools/utils'
import {type SpecType, type SpecDriver} from './spec-driver'
import {type Context} from './context'
import {isSelector, isSimpleCommonSelector, type Selector, type CommonSelector} from './selector'
import * as utils from '@applitools/utils'

const snippets = require('@applitools/snippets')

export type ElementReference<T extends SpecType> = T['element'] | T['secondary']['element'] | Selector<T>

type ElementState = {
  contentSize?: Size
  scrollOffset?: Location
  transforms?: any
  attributes?: Record<string, string | Error>
  touchPadding?: number
  containedElements?: Map<any, boolean>
}

type ElementOptions<T extends SpecType> = {
  spec: SpecDriver<T>
  context?: Context<T>
} & ({element: T['element']; selector?: Selector<T>; index?: number} | {selector: Selector<T>; index?: number})

export class Element<T extends SpecType> {
  private _target?: T['element']

  private _context?: Context<T>
  private _selector?: Selector<T>
  private _commonSelector: CommonSelector | null
  private _index?: number
  private _state: ElementState = {}
  private _originalOverflow: any

  protected readonly _spec: SpecDriver<T>

  constructor(options: ElementOptions<T>) {
    this._spec = options.spec
    this._context = options.context

    if (utils.types.has(options, 'element')) {
      this._target = options.element
      if (this._spec.isElement(this._target)) {
        // Some frameworks contains information about the selector inside an element
        this._selector = options.selector ?? this._spec.extractSelector?.(options.element)
        this._index = options.index
      }
    } else if (isSelector(options.selector, this._spec)) {
      this._selector = options.selector
    } else {
      throw new TypeError('Element constructor called with argument of unknown type!')
    }

    if (isSimpleCommonSelector(this._selector) && !utils.types.isString(this._selector)) {
      this._commonSelector = this._selector
    } else if (this._selector && this._spec.toSimpleCommonSelector) {
      this._commonSelector = this._spec.toSimpleCommonSelector(
        this._spec.toSelector?.(this._selector as CommonSelector<T>) ?? this._selector,
      )
    } else if (utils.types.isString(this._selector)) {
      this._commonSelector = {selector: this._selector}
    } else {
      this._commonSelector = null
    }
  }

  get logger() {
    return this._context!.logger
  }

  get target() {
    return this._target!
  }

  get selector() {
    return this._selector
  }

  get commonSelector() {
    return this._commonSelector
  }

  get index() {
    return this._index
  }

  get context() {
    return this._context!
  }

  get driver() {
    return this.context!.driver
  }

  get isRef() {
    return this.context?.isRef || !this.target
  }

  async equals(element: Element<T> | T['element']): Promise<boolean> {
    if (this.isRef) return false

    element = element instanceof Element ? element.target : element
    const environment = await this.driver.getEnvironment()
    if (environment.isWeb) {
      return this._spec
        .executeScript(this.context!.target, snippets.isEqualElements, [this.target, element])
        .catch(() => false)
    } else {
      return this._spec.isEqualElements?.(this.context!.target, this.target, element) ?? false
    }
  }

  async contains(innerElement: Element<T> | T['element']): Promise<boolean> {
    const contains = await this.withRefresh(async () => {
      innerElement = innerElement instanceof Element ? innerElement.target : innerElement
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        this.logger.log('Checking if web element with selector', this.selector, 'contains element', innerElement)
        return false // TODO implement a snipped for web
      } else {
        if (this._state.containedElements?.has(innerElement)) return this._state.containedElements.get(innerElement)!
        this.logger.log('Checking if native element with selector', this.selector, 'contains element', innerElement)
        // appium doesn't have a way to check if an element is contained in another element, so juristic applied
        if (await this.equals(innerElement)) return false
        // if the inner element region is contained in this element region, then it then could be assumed that the inner element is contained in this element
        const contentRegion = await this.getContentRegion()
        const innerRegion = await this._spec.getElementRegion!(this.driver.target, innerElement)
        const contains = utils.geometry.contains(contentRegion, innerRegion)
        this._state.containedElements ??= new Map()
        this._state.containedElements.set(innerElement, contains)
        return contains
      }
    })
    this.logger.log('Element with selector', this.selector, contains ? 'contains' : `doesn't contain`, innerElement)
    return contains
  }

  async init(context: Context<T>): Promise<this> {
    this._context = context
    if (this._target) return this

    if (this._selector) {
      const element = await this._context.element(this._selector)
      if (!element) throw new Error(`Cannot find element with selector ${JSON.stringify(this._selector)}`)
      this._target = element.target
    }
    return this
  }

  async getRegion(): Promise<Region> {
    const region = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        this.logger.log('Extracting region of web element with selector', this.selector)
        return this.context.execute(snippets.getElementRect, [this, false])
      } else {
        this.logger.log('Extracting region of native element with selector', this.selector)
        const region = await this._spec.getElementRegion!(this.driver.target, this.target)
        this.logger.log('Extracted native region', region)
        const normalizedRegion = await this.driver.normalizeRegion(region)

        // if element is a child of scrolling element, then region location should be adjusted
        const scrollingElement = await this.context.getScrollingElement()
        return (await scrollingElement?.contains(this))
          ? utils.geometry.offset(normalizedRegion, await scrollingElement!.getScrollOffset())
          : normalizedRegion
      }
    })
    this.logger.log('Extracted region', region)
    return region
  }

  async getClientRegion(): Promise<Region> {
    const region = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        this.logger.log('Extracting region of web element with selector', this.selector)
        return this.context.execute(snippets.getElementRect, [this, true])
      } else {
        return this.getRegion()
      }
    })
    this.logger.log('Extracted client region', region)
    return region
  }

  async getContentRegion(
    options: {lazyLoad?: {scrollLength?: number; waitingTime?: number; maxAmountToScroll?: number}} = {},
  ): Promise<Region> {
    const environment = await this.driver.getEnvironment()
    if (!environment.isNative) return null as never
    this.logger.log('Extracting content region of native element with selector', this.selector)
    const helper = await this.driver.getHelper()
    let contentRegion = await helper?.getContentRegion(this, options)
    this.logger.log('Extracted content region using helper library', contentRegion)

    if (!contentRegion || !environment.isAndroid) {
      let attrContentRegion = null as Region | null
      try {
        const size = JSON.parse(await this.getAttribute('contentSize'))
        attrContentRegion = {
          x: size.left,
          y: size.top,
          width: size.width,
          height: environment.isIOS
            ? Math.max(size.height, size.scrollableOffset)
            : size.height + size.scrollableOffset,
        }
      } catch (err: any) {
        this.logger.warn(`Unable to get the attribute 'contentSize' due to the following error: '${err.message}'`)
      }
      this.logger.log('Extracted content region using attribute', attrContentRegion!)

      // ios workaround
      if (!attrContentRegion && environment.isIOS) {
        try {
          const type = await this.getAttribute('type')
          if (type === 'XCUIElementTypeScrollView') {
            const [child] = await this.driver.elements({
              type: 'xpath',
              selector: '//XCUIElementTypeScrollView[1]/*', // We cannot be sure that our element is the first one
            })
            if (child) {
              const region = await this._spec.getElementRegion!(this.driver.target, this.target)
              const childRegion = await this._spec.getElementRegion!(this.driver.target, child.target)
              attrContentRegion = {
                ...region,
                height: childRegion.y + childRegion.height - region.y,
              }
            }
          }
        } catch (err: any) {
          this.logger.warn(
            `Unable to calculate content region using iOS workaround due to the following error: '${err.message}'`,
          )
        }
        this.logger.log('Extracted content region using iOS workaround', attrContentRegion)
      }

      if (attrContentRegion) {
        contentRegion = {
          x: attrContentRegion.x,
          y: attrContentRegion.y,
          width: Math.max(contentRegion?.width ?? 0, attrContentRegion.width),
          height: Math.max(contentRegion?.height ?? 0, attrContentRegion.height),
        }
      }
    }

    return contentRegion ?? (await this._spec.getElementRegion!(this.driver.target, this.target))
  }

  async getContentSize(
    options: {lazyLoad?: {scrollLength?: number; waitingTime?: number; maxAmountToScroll?: number}} = {},
  ): Promise<Size> {
    if (this._state.contentSize) return this._state.contentSize

    const size = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        this.logger.log('Extracting content size of web element with selector', this.selector)
        return this.context.execute(snippets.getElementContentSize, [this])
      } else {
        this.logger.log('Extracting content size of native element with selector', this.selector)
        try {
          const contentRegion = await this.getContentRegion(options)
          this._state.contentSize = utils.geometry.size(contentRegion)
          const viewport = await this.driver.getViewport()
          if (environment.isAndroid) {
            this._state.contentSize = utils.geometry.scale(this._state.contentSize, 1 / viewport.pixelRatio)
          }
          if (contentRegion.y < viewport.statusBarSize!) {
            this._state.contentSize.height -= viewport.statusBarSize! - contentRegion.y
          }
          return this._state.contentSize
        } catch (err) {
          this.logger.warn('Failed to extract content size, extracting client size instead')
          this.logger.error(err)
          return utils.geometry.size(await this.getClientRegion())
        }
      }
    })

    this.logger.log('Extracted content size', size)
    return size
  }

  async isPager(): Promise<boolean> {
    this.logger.log('Check if element with selector', this.selector, 'is scrollable by pages')
    const isPager = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isAndroid) {
        const className = await this.getAttribute('className')
        return ['androidx.viewpager.widget.ViewPager'].includes(className)
      } else {
        return false
      }
    })
    this.logger.log('Element scrollable by pages', isPager)
    return isPager
  }

  async isScrollable(): Promise<boolean> {
    this.logger.log('Check if element with selector', this.selector, 'is scrollable')
    const isScrollable = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        return this.context.execute(snippets.isElementScrollable, [this])
      } else if (environment.isAndroid) {
        const data = JSON.parse(await this.getAttribute('scrollable'))
        return Boolean(data) || false
      } else if (environment.isIOS) {
        const type = await this.getAttribute('type')
        return ['XCUIElementTypeScrollView', 'XCUIElementTypeTable', 'XCUIElementTypeCollectionView'].includes(type)
      }
    })
    this.logger.log('Element is scrollable', isScrollable)
    return isScrollable
  }

  async isRoot(): Promise<boolean> {
    // TODO replace with snippet
    return this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        const rootElement = await this.context.element({type: 'css', selector: 'html'})
        return this.equals(rootElement!)
      } else {
        return false
      }
    })
  }

  async getShadowRoot(): Promise<T['element'] | null> {
    const environment = await this.driver.getEnvironment()
    if (!environment.isWeb) return null
    return this._spec.executeScript(this.context.target, snippets.getShadowRoot, [this.target])
  }

  async getTouchPadding(): Promise<number> {
    if (this._state.touchPadding == null) {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) this._state.touchPadding = 0
      else if (environment.isIOS) this._state.touchPadding = 10
      else if (environment.isAndroid) {
        const helper = await this.driver.getHelper()
        if (helper?.name === 'android') {
          this._state.touchPadding = await helper.getTouchPadding()
          this.logger.log('Touch padding extracted using helper library', this._state.touchPadding)
        }
        if (!this._state.touchPadding) {
          this._state.touchPadding = await this.getAttribute('contentSize')
            .then(data => JSON.parse(data).touchPadding)
            .catch(err => {
              this.logger.warn(
                `Unable to get the attribute 'contentSize' when looking up 'touchPadding' due to the following error: '${err.message}'`,
              )
            })
          this.logger.log('Touch padding extracted using attribute', this._state.touchPadding)
        }
        this._state.touchPadding ??= 20
        this.logger.log('Touch padding set:', this._state.touchPadding)
      }
    }
    return this._state.touchPadding!
  }

  async getText(): Promise<string> {
    const text = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        return ''
      } else {
        this.logger.log('Extracting text of native element with selector', this.selector)
        return this._spec.getElementText!(this.context.target, this.target)
      }
    })
    this.logger.log('Extracted element text', text)
    return text
  }

  async getAttribute(name: string): Promise<string> {
    // we assumes that attributes are not changed during the session
    if (this._state.attributes?.[name]) {
      if (this._state.attributes[name] instanceof Error) throw this._state.attributes[name]
      return this._state.attributes[name] as any
    }

    const value = await this.withRefresh(async () => {
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        const properties = await this.context.execute(snippets.getElementProperties, [this, [name]])
        return properties[name]
      } else {
        this.logger.log(`Extracting "${name}" attribute of native element with selector`, this.selector)
        this._state.attributes ??= {}
        try {
          this._state.attributes[name] = await this._spec.getElementAttribute!(this.driver.target, this.target, name)
          return this._state.attributes[name]
        } catch (err: any) {
          this._state.attributes[name] = err
          throw err
        } finally {
          if (environment.isAndroid && name === 'contentSize') {
            // android has a bug when after extracting 'contentSize' attribute the element is being scrolled by undetermined number of pixels
            this.logger.log('Stabilizing android scroll offset')
            const originalScrollOffset = await this.getScrollOffset()
            await this.scrollTo({x: 0, y: 0}, {force: true})
            await this.scrollTo(originalScrollOffset)
          }
        }
      }
    })

    this.logger.log(`Extracted element "${name}" attribute:`, value)
    return value
  }

  async setAttribute(name: string, value: string): Promise<void> {
    const environment = await this.driver.getEnvironment()
    if (environment.isWeb) {
      await this.context.execute(snippets.setElementAttributes, [this, {[name]: value}])
    }
  }

  async scrollTo(offset: Location, options?: {force: boolean}): Promise<Location> {
    return this.withRefresh(async () => {
      this.logger.log(`Scrolling to offset (${offset.x}, ${offset.y}) element with selector`, this.selector)
      offset = utils.geometry.round({x: Math.max(offset.x, 0), y: Math.max(offset.y, 0)})
      const environment = await this.driver.getEnvironment()
      if (environment.isWeb) {
        let actualOffset = await this.context.execute(snippets.scrollTo, [this, offset])
        // iOS has an issue when scroll offset is read immediately after it is been set it will always return the exact value that was set
        if (environment.isIOS) actualOffset = await this.getScrollOffset()
        return actualOffset
      } else {
        const currentScrollOffset = await this.getScrollOffset()

        if (!options?.force && utils.geometry.equals(offset, currentScrollOffset)) return currentScrollOffset

        if (utils.geometry.equals(offset, {x: 0, y: 0}) && environment.isAndroid) {
          const helper = await this.driver.getHelper()
          if (helper?.name === 'android') {
            await helper.scrollToTop(this)
            this._state.scrollOffset = offset
            return this._state.scrollOffset
          }
        }

        const contentSize = await this.getContentSize()
        const scrollableRegion = await this.getClientRegion()

        const maxOffset = {
          x: Math.round(scrollableRegion.width * (contentSize.width / scrollableRegion.width - 1)),
          y: Math.round(scrollableRegion.height * (contentSize.height / scrollableRegion.height - 1)),
        }
        const requiredOffset = {x: Math.min(offset.x, maxOffset.x), y: Math.min(offset.y, maxOffset.y)}

        let effectiveRegion = scrollableRegion
        let remainingOffset = utils.geometry.equals(requiredOffset, {x: 0, y: 0})
          ? {x: -maxOffset.x, y: -maxOffset.y} // if it has to be scrolled to the very beginning, then scroll maximum amount of pixels
          : utils.geometry.offsetNegative(requiredOffset, currentScrollOffset)

        if (environment.isAndroid) {
          const viewport = await this.driver.getViewport()
          remainingOffset = utils.geometry.round(utils.geometry.scale(remainingOffset, viewport.pixelRatio))
          effectiveRegion = utils.geometry.round(utils.geometry.scale(effectiveRegion, viewport.pixelRatio))
        }

        const isPager = await this.isPager()
        const touchPadding = await this.getTouchPadding()

        const actions = []
        // horizontal scrolling
        const xPadding = touchPadding + 3
        const yTrack = Math.floor(effectiveRegion.y + effectiveRegion.height / 2) // center
        const xLeft = effectiveRegion.y + xPadding
        const xDirection = remainingOffset.x > 0 ? 'right' : 'left'
        const xGap = xDirection === 'right' ? -touchPadding : touchPadding
        const xCompensation = xDirection === 'right' ? -1 : 1
        let xRemaining = Math.abs(remainingOffset.x)
        if (isPager) {
          const xPages = Math.floor(xRemaining / effectiveRegion.width)
          xRemaining = (effectiveRegion.width - xPadding * 2) * xPages
        }
        while (xRemaining > 0) {
          const xRight = effectiveRegion.x + Math.min(xRemaining + xPadding, effectiveRegion.width - xPadding)
          const [xStart, xEnd] = xDirection === 'right' ? [xRight, xLeft] : [xLeft, xRight]
          if (isPager) {
            actions.push([
              {action: 'press', y: yTrack, x: xStart},
              // scroll through the page
              {action: 'wait', ms: 170},
              {action: 'moveTo', y: yTrack, x: xEnd},
              {action: 'release'},
            ])
          } else if (environment.isAndroid) {
            actions.push([
              // move through scrolling gap (actual scrolling will be triggered only after that)
              {action: 'press', y: yTrack, x: xStart - xGap},
              {action: 'wait', ms: 100},
              {action: 'moveTo', y: yTrack, x: xStart + xCompensation},
              {action: 'wait', ms: 100},
              {action: 'moveTo', y: yTrack, x: xStart},
              // perform actual scrolling
              {action: 'wait', ms: 100},
              {action: 'moveTo', y: yTrack, x: xEnd},
              {action: 'release'},
            ])
          } else if (environment.isIOS) {
            actions.push([
              // move through scrolling gap (actual scrolling will be triggered only after that)
              {action: 'press', y: yTrack, x: xStart - xGap},
              {action: 'wait', ms: 100},
              {action: 'moveTo', y: yTrack, x: xStart},
              // perform actual scrolling
              {action: 'wait', ms: 100},
              {action: 'moveTo', y: yTrack, x: xEnd},
              // prevent inertial scrolling after release
              {action: 'wait', ms: 100},
              {action: 'moveTo', y: yTrack + 1, x: xEnd},
              {action: 'release'},
            ])
          }
          xRemaining -= xRight - xLeft
        }

        // vertical scrolling
        const yPadding = Math.max(Math.floor(effectiveRegion.height * 0.08), touchPadding + 3)
        const xTrack = Math.floor(effectiveRegion.x + 5) // a little bit off left border
        const yBottom = effectiveRegion.y + effectiveRegion.height - yPadding
        const yDirection = remainingOffset.y > 0 ? 'down' : 'up'
        const yGap = yDirection === 'down' ? -touchPadding : touchPadding
        const yCompensation = yDirection === 'down' ? -1 : 1
        let yRemaining = Math.abs(remainingOffset.y)
        if (isPager) {
          const yPages = Math.floor(yRemaining / effectiveRegion.height)
          yRemaining = (effectiveRegion.height - yPadding * 2) * yPages
        }
        while (yRemaining > 0) {
          const yTop = Math.max(yBottom - yRemaining, effectiveRegion.y + yPadding)
          const [yStart, yEnd] = yDirection === 'down' ? [yBottom, yTop] : [yTop, yBottom]
          if (isPager) {
            actions.push([
              {action: 'press', x: xTrack, y: yStart},
              // scroll through the page
              {action: 'wait', ms: 170},
              {action: 'moveTo', x: xTrack, y: yEnd},
              {action: 'release'},
            ])
          } else if (environment.isAndroid) {
            actions.push([
              // move through scrolling gap (actual scrolling will be triggered only after that)
              {action: 'press', x: xTrack, y: yStart - yGap},
              {action: 'wait', ms: 100},
              {action: 'moveTo', x: xTrack, y: yStart + yCompensation},
              {action: 'wait', ms: 100},
              {action: 'moveTo', x: xTrack, y: yStart},
              // perform actual scrolling
              {action: 'wait', ms: 100},
              {action: 'moveTo', x: xTrack, y: yEnd},
              {action: 'release'},
            ])
          } else if (environment.isIOS) {
            actions.push([
              // move through scrolling gap (actual scrolling will be triggered only after that)
              {action: 'press', x: xTrack, y: yStart - yGap},
              {action: 'wait', ms: 100},
              {action: 'moveTo', x: xTrack, y: yStart},
              // perform actual scrolling
              {action: 'wait', ms: 100},
              {action: 'moveTo', x: xTrack, y: yEnd},
              // prevent inertial scrolling after release
              {action: 'wait', ms: 100},
              {action: 'moveTo', x: xTrack + 1, y: yEnd},
              {action: 'release'},
            ])
          }
          yRemaining -= yBottom - yTop
        }

        // ios actions should be executed one-by-one sequentially, otherwise the result isn't stable
        // pages should be scrolled one-by-one as well
        if (isPager || environment.isIOS) {
          for (const action of actions) {
            await this._spec.performAction!(this.driver.target, action)
          }
        } else if (actions.length > 0) {
          await this._spec.performAction!(this.driver.target, actions.flat())
        }

        const actualScrollableRegion = await this.getClientRegion()
        this._state.scrollOffset = utils.geometry.offsetNegative(requiredOffset, {
          x: scrollableRegion.x - actualScrollableRegion.x,
          y: scrollableRegion.y - actualScrollableRegion.y,
        })

        return this._state.scrollOffset
      }
    })
  }

  async translateTo(offset: Location): Promise<Location> {
    offset = {x: Math.round(offset.x), y: Math.round(offset.y)}
    const environment = await this.driver.getEnvironment()
    if (environment.isWeb) {
      return this.withRefresh(async () => this.context.execute(snippets.translateTo, [this, offset]))
    } else {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    }
  }

  async getScrollOffset(): Promise<Location> {
    const environment = await this.driver.getEnvironment()
    if (environment.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementScrollOffset, [this]))
    } else {
      return this._state.scrollOffset ?? {x: 0, y: 0}
    }
  }

  async getTranslateOffset(): Promise<Location> {
    const environment = await this.driver.getEnvironment()
    if (environment.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementTranslateOffset, [this]))
    } else {
      throw new Error('Cannot apply css translate scrolling on non-web element')
    }
  }

  async getInnerOffset(): Promise<Location> {
    const environment = await this.driver.getEnvironment()
    if (environment.isWeb) {
      return this.withRefresh(() => this.context.execute(snippets.getElementInnerOffset, [this]))
    } else {
      return this.getScrollOffset()
    }
  }

  async hover(): Promise<void> {
    this.logger.log(`Hovering on the element with selector`, this.selector)
    await this._spec.hover?.(this.context.target, this.target)
  }

  async click(): Promise<void> {
    this.logger.log(`Clicking on the element with selector`, this.selector)
    await this._spec.click?.(this.context.target, this.target)
  }

  async type(value: string): Promise<void> {
    this.logger.log(`Typing text "${value}" in the element with selector`, this.selector)
    await this._spec.setElementText?.(this.context.target, this.target, value)
  }

  async preserveState(): Promise<ElementState> {
    const scrollOffset = await this.getScrollOffset()
    const environment = await this.driver.getEnvironment()
    const transforms = environment.isWeb
      ? await this.context.execute(snippets.getElementStyleProperties, [this, ['transform', '-webkit-transform']])
      : null
    if (!utils.types.has(this._state, ['scrollOffset', 'transforms'])) {
      this._state.scrollOffset = scrollOffset
      this._state.transforms = transforms
    }
    return {scrollOffset, transforms}
  }

  async restoreState(state: ElementState = this._state): Promise<void> {
    if (state.scrollOffset) await this.scrollTo(state.scrollOffset)
    if (state.transforms) await this.context.execute(snippets.setElementStyleProperties, [this, state.transforms])
    if (state === this._state) {
      this._state.scrollOffset = undefined
      this._state.transforms = undefined
    }
  }

  async hideScrollbars(): Promise<void> {
    const environment = await this.driver.getEnvironment()
    if (environment.isNative) return
    if (this._originalOverflow) return
    return this.withRefresh(async () => {
      const {overflow} = await this.context.execute(snippets.setElementStyleProperties, [this, {overflow: 'hidden'}])
      this._originalOverflow = overflow
    })
  }

  async restoreScrollbars(): Promise<void> {
    const environment = await this.driver.getEnvironment()
    if (environment.isNative) return
    if (!this._originalOverflow) return
    return this.withRefresh(async () => {
      await this.context.execute(snippets.setElementStyleProperties, [this, {overflow: this._originalOverflow}])
      this._originalOverflow = null
    })
  }

  async refresh(freshTarget?: T['element']): Promise<boolean> {
    if (this._spec.isElement(freshTarget)) {
      this._target = freshTarget
      return true
    }
    if (!this._selector) return false
    const element =
      this._index! > 0
        ? await this.context.elements(this._selector).then(elements => elements[this._index!])
        : await this.context.element(this._selector)
    if (element) {
      this._target = element.target
    }
    return Boolean(element)
  }

  async withRefresh<TResult>(operation: (...args: any[]) => TResult): Promise<TResult> {
    if (!this._spec.isStaleElementError) return operation()
    try {
      const result = await operation()
      // Some frameworks could handle stale element reference error by itself or doesn't throw an error
      if (this._spec.isStaleElementError(result, this.selector as T['selector'])) {
        const refreshed = await this.refresh()
        if (!refreshed) {
          throw result
        }
        return operation()
      }
      return result
    } catch (err) {
      if (this._spec.isStaleElementError(err)) {
        const refreshed = await this.refresh()
        if (refreshed) return operation()
      }
      throw err
    }
  }

  toJSON(): T['element'] {
    return this.target
  }
}

export function isElementInstance<T extends SpecType>(element: any): element is Element<T> {
  return element instanceof Element
}

export function isElement<T extends SpecType>(
  element: any,
  spec?: SpecDriver<T>,
): element is Element<T> | T['element'] | T['secondary']['element'] {
  return isElementInstance(element) || !!spec?.isElement(element) || !!spec?.isSecondaryElement?.(element)
}

export function isElementReference<T extends SpecType>(
  reference: any,
  spec?: SpecDriver<T>,
): reference is ElementReference<T> {
  return isElement(reference, spec) || isSelector(reference, spec)
}

export async function makeElement<T extends SpecType>(
  options: {
    spec: SpecDriver<T>
    context?: Context<T>
  } & (
    | {element: Element<T> | T['element'] | T['secondary']['element']; selector?: Selector<T>; index?: number}
    | {selector: Selector<T>; index?: number}
  ),
) {
  let element: Element<T>
  if (utils.types.has(options, 'element')) {
    if (options.element instanceof Element) {
      element = options.element
    } else {
      options.element = (await options.spec?.toElement?.(options.element)) ?? options.element
      element = new Element(options as ElementOptions<T>)
    }
  } else {
    element = new Element(options as ElementOptions<T>)
  }
  return element
}
