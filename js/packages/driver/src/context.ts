import type {Location, Size, Region} from '@applitools/utils'
import type {Cookie} from './types'
import {type SpecType, type SpecDriver, type WaitOptions} from './spec-driver'
import {type Driver} from './driver'
import {makeSelector, isSelector, isComplexSelector, type Selector} from './selector'
import {makeElement, isElement, isElementInstance, type ElementReference, type Element} from './element'
import * as utils from '@applitools/utils'

const snippets = require('@applitools/snippets')

export type ContextReference<T extends SpecType> = Element<T> | ElementReference<T> | string | number

export type NestedContextReference<T extends SpecType> = {
  reference: ContextReference<T>
  scrollingElement?: Element<T>
  parent?: Context<T> | ContextReference<T> | NestedContextReference<T>
}

type ContextState = {
  region?: Region
  clientRegion?: Region
  scrollingRegion?: Region
  innerOffset?: Location
}

type ContextOptions<T extends SpecType> = {
  spec: SpecDriver<T>
  context?: T['context']
  driver?: Driver<T>
  parent?: Context<T>
  reference?: ContextReference<T>
  element?: Element<T>
  scrollingElement?: Element<T>
}

export class Context<T extends SpecType> {
  private _target?: T['context']

  private _driver?: Driver<T>
  private _parent?: Context<T>
  private _element?: Element<T> | null
  private _reference?: ContextReference<T> | null
  private _scrollingElement?: Element<T> | null
  private _state: ContextState = {}

  private _isReference(reference: any): reference is ContextReference<T> {
    return (
      utils.types.isInteger(reference) ||
      utils.types.isString(reference) ||
      isElement(reference, this._spec) ||
      isSelector(reference, this._spec)
    )
  }

  protected readonly _spec: SpecDriver<T>

  constructor(options: ContextOptions<T>) {
    this._spec = options.spec

    if (options.context) {
      if (this._spec.isContext?.(options.context) ?? this._spec.isDriver(options.context)) {
        this._target = options.context
      } else {
        throw new TypeError('Context constructor called with target context of unknown type')
      }
    }

    if (this._isReference(options.reference)) {
      if (!options.parent) {
        throw new TypeError('Cannot construct child context without parent context')
      }

      this._reference = options.reference
      this._parent = options.parent
      this._scrollingElement = options.scrollingElement
      this._driver = options.driver || this._parent?.driver
    } else if (!options.reference) {
      this._scrollingElement = options.scrollingElement
      this._driver = options.driver!
    } else {
      throw new TypeError('Context constructor called with context reference of unknown type!')
    }
  }

  get logger() {
    return this._driver!.logger
  }

  get target(): T['driver'] {
    return this._target!
  }

  get driver(): Driver<T> {
    return this._driver!
  }

  get parent(): Context<T> | null {
    return this._parent ?? null
  }

  get main(): Context<T> {
    return this.parent?.main ?? this
  }

  get path(): Context<T>[] {
    return [...(this.parent?.path ?? []), this]
  }

  get isMain(): boolean {
    return this.main === this
  }

  get isCurrent(): boolean {
    return this.driver.currentContext === this
  }

  get isInitialized(): boolean {
    return Boolean(this._element) || this.isMain
  }

  get isRef(): boolean {
    return !this._target
  }

  private async _findElements(
    selector: Selector<T>,
    options: {all?: boolean; parent?: T['element']; wait?: WaitOptions} = {},
  ): Promise<T['element'][]> {
    await this.focus()

    const {parent, all, wait} = options

    const environment = await this.driver.getEnvironment()
    const transformedSelector = makeSelector({selector, spec: this._spec, environment})
    let elements = [] as T['element'][]
    if (wait) {
      if (this._spec.waitForSelector) {
        const element = await this._spec.waitForSelector(
          this.target,
          makeSelector({selector, spec: this._spec, environment}),
          parent,
          wait,
        )
        if (element) elements = [element]
      } else {
        let waiting = true
        const timeout = setTimeout(() => (waiting = false), wait.timeout)
        while (waiting) {
          const element = await this._spec.findElement(
            this.target,
            makeSelector({selector, spec: this._spec, environment}),
            parent,
          )
          if (element) {
            clearTimeout(timeout)
            elements = [element]
            break
          }
          await utils.general.sleep(wait.interval ?? 0)
        }
      }
    } else if (all) {
      elements = await this._spec.findElements(this.target, transformedSelector, parent)
    } else {
      const element = await this._spec.findElement(this.target, transformedSelector, parent)
      if (element) elements = [element]
    }

    if (isComplexSelector(selector, this._spec)) {
      const features = await this.driver.getFeatures()
      if (elements.length > 0) {
        if (selector.child && !features.nestedSelectors) {
          elements = await elements.reduce((result, element) => {
            return result.then(async result => {
              return result.concat(await this._findElements(selector.child!, {parent: element, all, wait}))
            })
          }, Promise.resolve([] as T['element'][]))
        } else if (selector.shadow && !features.nestedSelectors) {
          elements = await elements.reduce((result, element) => {
            return result.then(async result => {
              const root: T['element'] = await this._spec.executeScript(this.target, snippets.getShadowRoot, [element])
              return result.concat(root ? await this._findElements(selector.shadow!, {parent: root, all, wait}) : [])
            })
          }, Promise.resolve([] as T['element'][]))
        } else if (selector.frame) {
          elements = await elements.reduce((result, element) => {
            return result.then(async result => {
              const context = await this.context(element)
              return result.concat(await context._findElements(selector.frame!, {all, wait}))
            })
          }, Promise.resolve([] as T['element'][]))
        }
      }

      if (elements.length === 0 && selector.fallback) {
        elements = await this._findElements(selector.fallback, {parent})
      }
    }

    return elements
  }

  async init(): Promise<this> {
    if (this.isInitialized) return this
    if (!this._reference || !this.parent) {
      throw new TypeError('Cannot initialize context without a reference to the context element')
    }

    await this.parent.focus()

    this.logger.log('Context initialization')

    if (utils.types.isInteger(this._reference)) {
      this.logger.log('Getting context element using index:', this._reference)
      const elements = await this.parent.elements('frame, iframe')
      if (this._reference > elements.length) {
        throw new TypeError(`Context element with index ${this._reference} is not found`)
      }
      this._element = elements[this._reference]
    } else if (utils.types.isString(this._reference) || isSelector(this._reference, this._spec)) {
      if (utils.types.isString(this._reference)) {
        this.logger.log('Getting context element by name or id', this._reference)
        this._element = await this.parent
          .element(`iframe[name="${this._reference}"], iframe#${this._reference}`)
          .catch(() => null)
      }
      if (!this._element && isSelector(this._reference, this._spec)) {
        this.logger.log('Getting context element by selector', this._reference)
        this._element = await this.parent.element(this._reference)
      }
      if (!this._element) {
        throw new TypeError(
          `Context element with name, id, or selector ${JSON.stringify(this._reference)}' is not found`,
        )
      }
    } else if (isElement(this._reference, this._spec)) {
      this.logger.log('Initialize context from reference element', this._reference)
      this._element = await makeElement({
        spec: this._spec,
        context: this.parent,
        element: this._reference,
      })
    } else {
      throw new TypeError('Reference type does not supported')
    }

    this._reference = null

    return this
  }

  async focus(): Promise<this> {
    if (this.isCurrent) {
      return this
    } else if (this.isMain) {
      await this.driver.switchToMainContext()
      return this
    }

    if (this.isRef) {
      await this.init()
    }

    if (!this.parent!.isCurrent) {
      await this.driver.switchTo(this)
      return this
    }

    await this.parent!.preserveInnerOffset()

    if (this.parent!.isMain) await this.parent!.preserveContextRegions()
    await this.preserveContextRegions()

    this._target = await this._spec.childContext(this.parent!.target, this._element!.target)

    this.driver.updateCurrentContext(this)

    return this
  }

  async equals(context: Context<T> | Element<T>): Promise<boolean> {
    if (context === this || (this.isMain && context === null)) return true
    if (!this._element) return false
    return this._element.equals(context instanceof Context ? (await context.getContextElement())! : context)
  }

  async context(reference: ContextReference<T> | NestedContextReference<T>): Promise<Context<T>> {
    if (reference instanceof Context) {
      if (reference.parent !== this && !(await this.equals(reference.parent!))) {
        throw Error('Cannot attach a child context because it has a different parent')
      }
      return reference
    } else if (this._isReference(reference)) {
      return new Context({spec: this._spec, parent: this, driver: this.driver, reference})
    } else if (utils.types.has(reference, 'reference')) {
      if (reference.reference instanceof Context) return this
      const parent = reference.parent ? await this.context(reference.parent) : this
      return new Context({
        spec: this._spec,
        parent,
        driver: this.driver,
        reference: reference.reference,
        scrollingElement: reference?.scrollingElement,
      })
    } else {
      throw new Error('Cannot get context using reference of unknown type!')
    }
  }

  async element(elementOrSelector: ElementReference<T>): Promise<Element<T> | null> {
    if (isElement(elementOrSelector, this._spec)) {
      return makeElement({spec: this._spec, context: this, element: elementOrSelector})
    } else if (!isSelector(elementOrSelector, this._spec)) {
      throw new TypeError('Cannot find element using argument of unknown type!')
    }
    if (this.isRef) {
      return makeElement({spec: this._spec, context: this, selector: elementOrSelector})
    }
    this.logger.log('Finding element by selector: ', elementOrSelector)
    const [element] = await this._findElements(elementOrSelector, {all: false})
    return element ? makeElement({spec: this._spec, context: this, element, selector: elementOrSelector}) : null
  }

  async elements(selectorOrElement: ElementReference<T>): Promise<Element<T>[]> {
    if (isSelector(selectorOrElement, this._spec)) {
      if (this.isRef) {
        return [await makeElement({spec: this._spec, context: this, selector: selectorOrElement})]
      }
      this.logger.log('Finding elements by selector: ', selectorOrElement)
      const elements = await this._findElements(selectorOrElement, {all: true})
      return Promise.all(
        elements.map((element, index) => {
          return makeElement({
            spec: this._spec,
            context: this,
            element,
            selector: selectorOrElement,
            index,
          })
        }),
      )
    } else if (isElement(selectorOrElement, this._spec)) {
      return [await makeElement({spec: this._spec, context: this, element: selectorOrElement})]
    } else {
      throw new TypeError('Cannot find elements using argument of unknown type!')
    }
  }

  async waitFor(selector: Selector<T>, options?: WaitOptions): Promise<Element<T> | null> {
    this.logger.log('Waiting for element by selector: ', selector, 'and options', options)
    const [element] = await this._findElements(selector, {
      wait: {state: 'exist', timeout: 10000, interval: 500, ...options},
    })
    return element ? makeElement({spec: this._spec, context: this, element, selector}) : null
  }

  async execute(script: ((args: any) => any) | string, arg?: any): Promise<any> {
    await this.focus()
    try {
      return await this._spec.executeScript(this.target, script, serialize.call(this, arg))
    } catch (err) {
      this.logger.warn('Error during script execution with argument', arg)
      this.logger.error(err)
      throw err
    }

    function serialize(this: Context<T>, value: any): any {
      if (isElement(value, this._spec)) {
        return isElementInstance(value) ? value.toJSON() : value
      } else if (utils.types.isArray(value)) {
        return value.map(value => serialize.call(this, value))
      } else if (utils.types.isObject(value)) {
        return Object.entries(value.toJSON?.() ?? value).reduce((serialized, [key, value]) => {
          return Object.assign(serialized, {[key]: serialize.call(this, value)})
        }, {})
      } else {
        return value
      }
    }
  }

  async executePoll(
    script: ((arg: any) => any) | string | {main: ((arg: any) => any) | string; poll: ((arg: any) => any) | string},
    arg?: any | {main: any; poll: any; executionTimeout?: number; pollTimeout?: number},
  ): Promise<any> {
    this.logger.log('Executing poll script')
    const {main: mainScript, poll: pollScript} =
      utils.types.isString(script) || utils.types.isFunction(script) ? {main: script, poll: script} : script
    const {
      main: mainArg,
      poll: pollArg,
      executionTimeout = 60000,
      pollTimeout = 1000,
    } = !utils.types.has(arg, ['main', 'poll']) ? {main: arg, poll: arg} : (arg as any)

    let isExecutionTimedOut = false
    const executionTimer = setTimeout(() => (isExecutionTimedOut = true), executionTimeout)
    try {
      let response = deserialize(await this.execute(mainScript, mainArg))
      let chunks = ''
      while (!isExecutionTimedOut) {
        if (response.status === 'ERROR') {
          throw new Error(`Error during execute poll script: '${response.error}'`)
        } else if (response.status === 'SUCCESS') {
          return response.value
        } else if (response.status === 'SUCCESS_CHUNKED') {
          chunks += response.value
          if (response.done) return deserialize(chunks)
        } else if (response.status === 'WIP') {
          await utils.general.sleep(pollTimeout)
        }
        this.logger.log('Polling...')
        response = deserialize(await this.execute(pollScript, pollArg))
      }
      throw new Error('Poll script execution is timed out')
    } finally {
      clearTimeout(executionTimer)
    }

    function deserialize(json: string) {
      try {
        return JSON.parse(json)
      } catch (err) {
        const firstChars = json.slice(0, 100)
        const lastChars = json.slice(-100)
        throw new Error(
          `Response is not a valid JSON string. length: ${json.length}, first 100 chars: "${firstChars}", last 100 chars: "${lastChars}". error: ${err}`,
        )
      }
    }
  }

  async getContextElement(): Promise<Element<T> | null> {
    if (this.isMain) return null
    await this.init()
    return this._element ?? null
  }

  async getScrollingElement(): Promise<Element<T> | null> {
    if (!isElementInstance(this._scrollingElement)) {
      await this.focus()
      const environment = await this.driver.getEnvironment()
      if (this._scrollingElement) {
        this._scrollingElement = await this.element(this._scrollingElement)
      } else if (environment.isWeb) {
        let selector
        if (environment.isIOS && !environment.isEmulation) {
          selector = 'html'
          this.logger.log(`Using hardcoded default scrolling element for Safari on iOS - "${selector}"`)
        } else {
          selector = await this.execute(snippets.getDocumentScrollingElement)
          this.logger.log(`Using dynamic default scrolling element - "${selector}"`)
        }
        this._scrollingElement = await this.element({type: 'css', selector})
      } else {
        this._scrollingElement = await this.element({type: 'xpath', selector: '//*[@scrollable="true"]'})
      }
    }
    return this._scrollingElement
  }

  async setScrollingElement(scrollingElement: Element<T> | ElementReference<T> | undefined | null): Promise<void> {
    if (scrollingElement === undefined) return
    else if (scrollingElement === null) this._scrollingElement = null
    else {
      this._scrollingElement = await this.element(scrollingElement)
    }
  }

  async blurElement(element?: Element<T>): Promise<T['element'] | null> {
    try {
      return await this.execute(snippets.blurElement, [element])
    } catch (err) {
      this.logger.warn('Cannot blur element', element)
      this.logger.error(err)
      return null
    }
  }

  async focusElement(element: Element<T>) {
    try {
      return await this.execute(snippets.focusElement, [element])
    } catch (err) {
      this.logger.warn('Cannot focus element', element)
      this.logger.error(err)
      return null
    }
  }

  async getRegion(): Promise<Region> {
    if (this.isMain && this.isCurrent) {
      const viewportRegion = utils.geometry.region({x: 0, y: 0}, await this.driver.getViewportSize())
      this._state.region = this._scrollingElement
        ? utils.geometry.region(
            {x: 0, y: 0},
            utils.geometry.intersect(viewportRegion, await this._scrollingElement.getRegion()),
          )
        : viewportRegion
    } else if (this.parent?.isCurrent) {
      await this.init()
      this._state.region = await this._element?.getRegion()
    }
    return this._state.region!
  }

  async getClientRegion(): Promise<Region> {
    if (this.isMain && this.isCurrent) {
      const viewportRegion = utils.geometry.region({x: 0, y: 0}, await this.driver.getViewportSize())
      this._state.clientRegion = this._scrollingElement
        ? utils.geometry.region(
            {x: 0, y: 0},
            utils.geometry.intersect(viewportRegion, await this._scrollingElement.getClientRegion()),
          )
        : viewportRegion
    } else if (this.parent?.isCurrent) {
      await this.init()
      this._state.clientRegion = await this._element?.getClientRegion()
    }
    return this._state.clientRegion!
  }

  async getScrollingRegion(): Promise<Region> {
    if (this.isCurrent) {
      const scrollingElement = await this.getScrollingElement()
      this._state.scrollingRegion = await scrollingElement?.getClientRegion()
    }
    return this._state.scrollingRegion!
  }

  async getContentSize(): Promise<Size> {
    return this.execute(snippets.getDocumentSize)
  }

  async getInnerOffset(): Promise<Location> {
    if (this.isCurrent) {
      const scrollingElement = await this.getScrollingElement()
      this._state.innerOffset = scrollingElement ? await scrollingElement.getInnerOffset() : {x: 0, y: 0}
    }
    return this._state.innerOffset!
  }

  async getLocationInMainContext(): Promise<Location> {
    return this.path.reduce((location, context) => {
      return location.then(async location => {
        return utils.geometry.offset(location, utils.geometry.location(await context.getClientRegion()))
      })
    }, Promise.resolve({x: 0, y: 0}))
  }

  async getLocationInViewport(): Promise<Location> {
    let location = utils.geometry.offsetNegative({x: 0, y: 0}, await this.getInnerOffset())

    if (this.isMain) return location

    let currentContext = this as Context<T> | null
    while (currentContext) {
      const contextLocation = utils.geometry.location(await currentContext.getClientRegion())
      const parentContextInnerOffset = (await currentContext.parent?.getInnerOffset()) ?? {x: 0, y: 0}

      location = utils.geometry.offsetNegative(
        utils.geometry.offset(location, contextLocation),
        parentContextInnerOffset,
      )
      currentContext = currentContext.parent
    }
    return location
  }

  async getRegionInViewport(region: Region): Promise<Region> {
    this.logger.log('Converting context region to viewport region', region)

    if (region) region = utils.geometry.offsetNegative(region, await this.getInnerOffset())
    else region = {x: 0, y: 0, width: Infinity, height: Infinity}

    let currentContext = this as Context<T> | null
    const environment = await this.driver.getEnvironment()
    while (currentContext) {
      const contextRegion = await currentContext.getClientRegion()
      // const contextScrollingRegion = await currentContext.getScrollingRegion()
      const parentContextInnerOffset = (await currentContext.parent?.getInnerOffset()) ?? {x: 0, y: 0}

      // TODO revisit
      if (
        environment.isWeb ||
        (!utils.geometry.equals(contextRegion, region) && utils.geometry.contains(contextRegion, region))
      ) {
        this.logger.log('Intersecting context region', contextRegion, 'with context region', region)

        region = utils.geometry.intersect(contextRegion, utils.geometry.offset(region, contextRegion))
        // region = utils.geometry.intersect(contextScrollingRegion, region)
        region = utils.geometry.offsetNegative(region, parentContextInnerOffset)
      }
      currentContext = currentContext.parent
    }
    return region
  }

  async getCookies(): Promise<Cookie[]> {
    const environment = await this.driver.getEnvironment()
    if (!environment.isWeb) return []
    await this.focus()
    const cookies = await this._spec.getCookies?.(this.target, true)
    this.logger.log('Extracted context cookies', cookies)
    return cookies ?? []
  }

  private async preserveInnerOffset() {
    this._state.innerOffset = await this.getInnerOffset()
  }

  private async preserveContextRegions() {
    this._state.region = await this.getRegion()
    this._state.clientRegion = await this.getClientRegion()
  }

  private async preserveScrollingRegion() {
    this._state.scrollingRegion = await this.getScrollingRegion()
  }
}
