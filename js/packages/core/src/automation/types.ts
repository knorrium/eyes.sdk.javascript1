import type {MaybeArray, Size, Region, ControlledPromise} from '@applitools/utils'
import type * as BaseCore from '@applitools/core-base/types'
import {type SpecType, type Driver, type ElementReference, type ContextReference} from '@applitools/driver'
import {type NMLClient, type NMLClientSettings} from '@applitools/nml-client'
import {type Logger} from '@applitools/logger'

export type * from '@applitools/core-base/types'

export type DriverTarget<TSpec extends SpecType> = TSpec['driver'] | Driver<TSpec>
export type Target<TSpec extends SpecType> = DriverTarget<TSpec> | BaseCore.Target

export interface DesktopBrowserRenderer {
  name?:
    | 'chrome'
    | 'chrome-one-version-back'
    | 'chrome-two-versions-back'
    | 'firefox'
    | 'firefox-one-version-back'
    | 'firefox-two-versions-back'
    | 'safari'
    | 'safari-earlyaccess'
    | 'safari-one-version-back'
    | 'safari-two-versions-back'
    | 'edgechromium'
    | 'edgechromium-one-version-back'
    | 'edgechromium-two-versions-back'
    | 'edge'
    | 'edgelegacy'
    | 'ie'
    | 'ie10'
  width: number
  height: number
}
export interface ChromeEmulationDeviceRenderer {
  chromeEmulationInfo: {
    deviceName:
      | 'Kindle Fire HDX'
      | 'Blackberry PlayBook'
      | 'BlackBerry Z30'
      | 'Galaxy Note 2'
      | 'Galaxy S3'
      | 'Galaxy Note 3'
      | 'Galaxy Note 4'
      | 'Galaxy A5'
      | 'Galaxy S5'
      | 'Galaxy S8'
      | 'Galaxy S8 Plus'
      | 'Galaxy Note 8'
      | 'Galaxy S9'
      | 'Galaxy S9 Plus'
      | 'Galaxy Note 9'
      | 'Galaxy S10'
      | 'Galaxy S10 Plus'
      | 'Galaxy Note 10'
      | 'Galaxy Note 10 Plus'
      | 'Galaxy S20'
      | 'Galaxy S21'
      | 'Galaxy S21 Ultra'
      | 'Galaxy S22'
      | 'Galaxy S22 Ultra'
      | 'Galaxy Tab S7'
      | 'iPhone 4'
      | 'iPhone 5/SE'
      | 'iPhone 6/7/8'
      | 'iPhone 6/7/8 Plus'
      | 'iPhone X'
      | 'iPhone XR'
      | 'iPhone XS'
      | 'iPhone XS Max'
      | 'iPhone 11'
      | 'iPhone 11 Pro'
      | 'iPhone 11 Pro Max'
      | 'iPad'
      | 'iPad 6th Gen'
      | 'iPad 7th Gen'
      | 'iPad Air 2'
      | 'iPad Mini'
      | 'iPad Pro'
      | 'LG G6'
      | 'LG Optimus L70'
      | 'Nexus 10'
      | 'Nexus 4'
      | 'Nexus 5'
      | 'Nexus 5X'
      | 'Nexus 6'
      | 'Nexus 6P'
      | 'Nexus 7'
      | 'Pixel 2'
      | 'Pixel 2 XL'
      | 'Pixel 3'
      | 'Pixel 3 XL'
      | 'Pixel 4'
      | 'Pixel 4 XL'
      | 'Pixel 5'
      | 'Sony Xperia 10 II'
      | 'Huawei Mate 50 Pro'
      | 'Huawei Matepad 11'
      | 'OnePlus 7T'
      | 'OnePlus 7T Pro'
      | 'Nokia N9'
      | 'Nokia Lumia 520'
      | 'Microsoft Lumia 550'
      | 'Microsoft Lumia 950'
      | 'Laptop with HiDPI screen'
      | 'Laptop with MDPI screen'
      | 'Laptop with touch'
    screenOrientation?: 'portrait' | 'landscape'
  }
}
export interface IOSDeviceRenderer {
  iosDeviceInfo: {
    deviceName:
      | 'iPhone 6s'
      | 'iPhone 6s Plus'
      | 'iPhone 7'
      | 'iPhone 7 Plus'
      | 'iPhone 8'
      | 'iPhone 8 Plus'
      | 'iPhone X'
      | 'iPhone XR'
      | 'iPhone Xs'
      | 'iPhone Xs Max'
      | 'iPhone 11'
      | 'iPhone 11 Pro'
      | 'iPhone 11 Pro Max'
      | 'iPhone 12'
      | 'iPhone 12 mini'
      | 'iPhone 12 Pro'
      | 'iPhone 12 Pro Max'
      | 'iPhone 13'
      | 'iPhone 13 mini'
      | 'iPhone 13 Pro'
      | 'iPhone 13 Pro Max'
      | 'iPhone 14'
      | 'iPhone 14 Plus'
      | 'iPhone 14 Pro'
      | 'iPhone 14 Pro Max'
      | 'iPhone SE (1st generation)'
      | 'iPhone SE (2nd generation)'
      | 'iPhone SE (3rd generation)'
      | 'iPad (5th generation)'
      | 'iPad (6th generation)'
      | 'iPad (7th generation)'
      | 'iPad (8th generation)'
      | 'iPad (9th generation)'
      | 'iPad (10th generation)'
      | 'iPad Air 2'
      | 'iPad Air (3rd generation)'
      | 'iPad Air (4th generation)'
      | 'iPad Air (5th generation)'
      | 'iPad mini 4'
      | 'iPad mini (5th generation)'
      | 'iPad mini (6th generation)'
      | 'iPad Pro (9.7-inch)'
      | 'iPad Pro (10.5-inch)'
      | 'iPad Pro (11-inch) (1st generation)'
      | 'iPad Pro (12.9-inch) (1st generation)'
      | 'iPad Pro (11-inch) (2nd generation)'
      | 'iPad Pro (12.9-inch) (2nd generation)'
      | 'iPad Pro (11-inch) (3rd generation)'
      | 'iPad Pro (12.9-inch) (3rd generation)'
      | 'iPad Pro (11-inch) (4th generation)'
      | 'iPad Pro (12.9-inch) (4th generation)'
      | 'iPad Pro (12.9-inch) (5th generation)'
      | 'iPad Pro (12.9-inch) (6th generation)'
      | 'iPod touch (7th generation)'
    version?: string
    screenOrientation?: 'portrait' | 'landscape'
  }
}
export interface AndroidDeviceRenderer {
  androidDeviceInfo: {
    deviceName:
      | 'Pixel 3 XL'
      | 'Pixel 4'
      | 'Pixel 4 XL'
      | 'Pixel 5'
      | 'Pixel 6'
      | 'Galaxy S10'
      | 'Galaxy S10 Plus'
      | 'Galaxy Note 10'
      | 'Galaxy Note 10 Plus'
      | 'Galaxy S20'
      | 'Galaxy S20 Plus'
      | 'Galaxy S21'
      | 'Galaxy S21 Plus'
      | 'Galaxy S21 Ultra'
      | 'Galaxy S22'
      | 'Galaxy S22 Plus'
      | 'Galaxy Tab S7'
      | 'Galaxy Tab S8'
      | 'Xiaomi Redmi Note 10 JE'
      | 'Xiaomi Redmi Note 11'
      | 'Xiaomi Redmi Note 11 Pro'
      | 'Sony Xperia 1 II'
      | 'Sony Xperia 10 II'
      | 'Sony Xperia Ace II'
      | 'Huawei P30 Lite'
    version?: string
    screenOrientation?: 'portrait' | 'landscape'
  }
}
export interface EnvironmentRenderer {
  environment: BaseCore.Environment
}
export type Renderer = (
  | DesktopBrowserRenderer
  | ChromeEmulationDeviceRenderer
  | IOSDeviceRenderer
  | AndroidDeviceRenderer
  | EnvironmentRenderer
) & {
  properties?: BaseCore.CustomProperty[]
  /**
   * The id of the renderer
   * Used to identify the renderer if the same renderer is used multiple times
   * @internal
   **/
  id?: string
}
export interface Core<TSpec extends SpecType> extends BaseCore.Core {
  readonly base: BaseCore.Core
  getViewportSize?(options: {target: DriverTarget<TSpec>; logger?: Logger}): Promise<Size>
  setViewportSize?(options: {target: DriverTarget<TSpec>; size: Size; logger?: Logger}): Promise<void>
  getNMLClient(options: {
    settings: Omit<NMLClientSettings, 'brokerUrl'>
    driver: Driver<TSpec>
    logger?: Logger
  }): Promise<NMLClient>
  openEyes(options: {
    target?: DriverTarget<TSpec>
    settings: BaseCore.OpenSettings
    storage?: EyesStorage
    logger?: Logger
  }): Promise<Eyes<TSpec>>
  locate<TLocator extends string>(options: {
    target: Target<TSpec>
    settings: LocateSettings<TLocator, TSpec>
    logger?: Logger
  }): Promise<BaseCore.LocateResult<TLocator>>
  locateText<TPattern extends string>(options: {
    target: Target<TSpec>
    settings: LocateTextSettings<TPattern, TSpec>
    logger?: Logger
  }): Promise<BaseCore.LocateTextResult<TPattern>>
  extractText(options: {
    target: Target<TSpec>
    settings: MaybeArray<ExtractTextSettings<TSpec>>
    logger?: Logger
  }): Promise<string[]>
}

export interface Eyes<TSpec extends SpecType> extends BaseCore.Eyes {
  readonly core: Core<TSpec>
  readonly storage: EyesStorage
  getBaseEyes(options: {settings: GetBaseEyesSettings; logger?: Logger}): Promise<BaseCore.Eyes>
  check(options?: {target?: Target<TSpec>; settings?: CheckSettings<TSpec>; logger?: Logger}): Promise<void>
  checkAndClose(options?: {
    target?: Target<TSpec>
    settings?: CheckSettings<TSpec> & BaseCore.CloseSettings
    logger?: Logger
  }): Promise<void>
  close(options?: {settings?: CloseSettings; logger?: Logger}): Promise<void>
  abort(options?: {settings?: AbortSettings; logger?: Logger}): Promise<void>
  getResults(options?: {settings?: BaseCore.GetResultsSettings; logger?: Logger}): Promise<TestResult[]>
}

export type EyesStorage = Map<string, {eyes: ControlledPromise<BaseCore.Eyes>; jobs: Promise<void>[]}>

export interface GetBaseEyesSettings {
  renderer: Renderer
}

export interface ScreenshotSettings<TSpec extends SpecType>
  extends BaseCore.ImageSettings<Region | ElementReference<TSpec>> {
  webview?: boolean | string
  frames?: (ContextReference<TSpec> | {frame: ContextReference<TSpec>; scrollRootElement?: ElementReference<TSpec>})[]
  fully?: boolean
  scrollRootElement?: ElementReference<TSpec>
  stitchMode?: 'Scroll' | 'CSS' | 'Resize'
  screenshotMode?: 'default' | 'applitools-lib'
  hideScrollbars?: boolean
  hideCaret?: boolean
  overlap?: {top?: number; bottom?: number}
  waitBeforeCapture?: number
  waitBetweenStitches?: number
  lazyLoad?: boolean | {scrollLength?: number; waitingTime?: number; maxAmountToScroll?: number}
  sendDom?: boolean
}

export type LocateSettings<TLocator extends string, TSpec extends SpecType> = BaseCore.LocateSettings<
  TLocator,
  Region | ElementReference<TSpec>
> &
  ScreenshotSettings<TSpec>

export type LocateTextSettings<TPattern extends string, TSpec extends SpecType> = BaseCore.LocateTextSettings<
  TPattern,
  Region | ElementReference<TSpec>
> &
  ScreenshotSettings<TSpec>

export type ExtractTextSettings<TSpec extends SpecType> = BaseCore.ExtractTextSettings<
  Region | ElementReference<TSpec>
> &
  ScreenshotSettings<TSpec>

export type CheckSettings<TSpec extends SpecType> = BaseCore.CheckSettings<Region | ElementReference<TSpec>> &
  ScreenshotSettings<TSpec> & {renderers?: Renderer[]}

export type CloseSettings = BaseCore.CloseSettings & {renderers?: Renderer[]}

export type AbortSettings = BaseCore.AbortSettings & {renderers?: Renderer[]}

export type TestResult = BaseCore.TestResult & {
  readonly renderer: Renderer
}
