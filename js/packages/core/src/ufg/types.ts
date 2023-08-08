import type {MaybeArray} from '@applitools/utils'
import type * as BaseCore from '@applitools/core-base/types'
import type * as AutomationCore from '../automation/types'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {type Proxy} from '@applitools/req'
import {
  type UFGClient,
  type UFGClientSettings,
  type RenderEnvironmentSettings,
  type Renderer,
  type DomSnapshot,
  type AndroidSnapshot,
  type IOSSnapshot,
} from '@applitools/ufg-client'

export * from '../automation/types'

export type SnapshotTarget = MaybeArray<DomSnapshot> | MaybeArray<AndroidSnapshot> | MaybeArray<IOSSnapshot>
export type Target<TSpec extends SpecType> = SnapshotTarget | AutomationCore.Target<TSpec>

export interface Core<TSpec extends SpecType> extends AutomationCore.Core<TSpec> {
  readonly type: 'ufg'
  getUFGClient(options?: {settings: UFGClientSettings; logger?: Logger}): Promise<UFGClient>
  openEyes(options: {
    target?: AutomationCore.DriverTarget<TSpec>
    settings: AutomationCore.OpenSettings
    base?: BaseCore.Eyes[]
    logger?: Logger
  }): Promise<Eyes<TSpec>>
}

export interface Eyes<TSpec extends SpecType> extends AutomationCore.Eyes<TSpec> {
  readonly type: 'ufg'
  readonly core: Core<TSpec>
  getBaseEyes(options?: {settings?: GetBaseEyesSettings; logger?: Logger}): Promise<BaseCore.Eyes[]>
  check(options?: {target?: Target<TSpec>; settings?: CheckSettings<TSpec>; logger?: Logger}): Promise<CheckResult[]>
  checkAndClose(options?: {
    target?: Target<TSpec>
    settings?: CheckSettings<TSpec> & AutomationCore.CloseSettings
    logger?: Logger
  }): Promise<void>
  getResults(options?: {settings?: AutomationCore.GetResultsSettings; logger?: Logger}): Promise<TestResult[]>
}

export type GetBaseEyesSettings = RenderEnvironmentSettings & {
  properties?: BaseCore.CustomProperty[]
}

export type CheckSettings<TSpec extends SpecType> = AutomationCore.CheckSettings<TSpec> & {
  renderers?: (Renderer & {properties?: BaseCore.CustomProperty[]})[]
  hooks?: {beforeCaptureScreenshot: string}
  disableBrowserFetching?: boolean
  layoutBreakpoints?: {breakpoints: number[] | boolean; reload?: boolean}
  ufgOptions?: Record<string, any>
  autProxy?: Proxy & {mode?: 'Allow' | 'Block'; domains?: string[]}
  headers?: Record<string, string>
}

export type CheckResult = AutomationCore.CheckResult & {
  readonly renderer: Renderer
}

export type TestResult = AutomationCore.TestResult & {
  readonly renderer: Renderer
}
