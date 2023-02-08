import type {Region} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {type SpecType, type SpecDriver} from './spec-driver'
import {type Driver} from './driver'
import {type Element} from './element'

export class HelperIOS<T extends SpecType> {
  static async make<T extends SpecType>(options: {
    spec: SpecDriver<T>
    driver: Driver<T>
    logger: Logger
  }): Promise<HelperIOS<T> | null> {
    const {spec, driver, logger} = options
    const element = await driver.element({type: 'name', selector: 'applitools_grab_scrollable_data_button'})
    return element ? new HelperIOS<T>({driver, element, spec, logger}) : null
  }

  private readonly _driver: Driver<T>
  private readonly _element: Element<T>
  private readonly _spec: SpecDriver<T>
  private _logger: Logger

  readonly name: 'ios'

  constructor(options: {driver: Driver<T>; element: Element<T>; spec: SpecDriver<T>; logger: Logger}) {
    this._driver = options.driver
    this._element = options.element
    this._spec = options.spec
    this._logger = options.logger
    this.name = 'ios'
  }

  async getContentRegion(element: Element<T>): Promise<Region | null> {
    await this._element.click()

    const sizeLabel = await this._driver.element({type: 'name', selector: 'applitools_content_size_label'})
    const sizeString = await sizeLabel?.getText()
    if (!sizeString) return null
    const [, width, height] = sizeString.match(/\{(-?\d+(?:\.\d+)?),\s?(-?\d+(?:\.\d+)?)\}/)!
    const contentSize = {width: Number(width), height: Number(height)}
    if (Number.isNaN(contentSize.width + contentSize.height)) return null
    const paddingLabel = await this._driver.element({type: 'name', selector: 'applitools_content_offset_label'})
    const paddingString = await paddingLabel?.getText()
    if (paddingString) {
      const [, x, y] = paddingString.match(/\{(-?\d+(?:\.\d+)?),\s?(-?\d+(?:\.\d+)?)\}/)!
      const contentOffset = {x: Number(x), y: Number(y)}
      if (!Number.isNaN(contentOffset.x)) contentSize.width -= contentOffset.x
      if (!Number.isNaN(contentOffset.y)) contentSize.height -= contentOffset.y
    }

    const region = await this._spec.getElementRegion?.(this._driver.target, element.target)
    if (!region || contentSize.height < region.height) return null

    return contentSize.height >= region.height ? {x: region.x, y: region.y, ...contentSize} : null
  }
}
