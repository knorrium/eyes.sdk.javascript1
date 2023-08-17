import type {SpecDriver} from '@applitools/driver'
import {extractEnvironment} from './extract-environment'
import * as eyes from '@applitools/eyes'
import * as spec from './spec-driver'

export * from '@applitools/eyes'
export * from './legacy'

export type Driver = spec.WDIODriver
export type Element = spec.WDIOElement
export type Selector = spec.WDIOSelector
export type SpecType = spec.WDIOSpecType

const sdk = {
  spec: spec as unknown as SpecDriver<SpecType>,
  agentId: `eyes-webdriverio/${require('../package.json').version}`,
  environment: extractEnvironment(),
}

export class Eyes extends eyes.Eyes<SpecType> {
  protected static readonly _sdk = sdk
  static setViewportSize: (driver: Driver, viewportSize: eyes.RectangleSize) => Promise<void>
}

export type CheckSettingsAutomationPlain = eyes.CheckSettingsAutomationPlain<SpecType>
export class CheckSettingsAutomation extends eyes.CheckSettingsAutomation<SpecType> {
  protected static readonly _spec = sdk.spec
}
export class CheckSettings extends CheckSettingsAutomation {}

export type TargetAutomation = eyes.TargetAutomation<SpecType>
export const TargetAutomation = {...eyes.TargetAutomation, spec: sdk.spec} as TargetAutomation
export type Target = eyes.Target<SpecType>
export const Target = {...eyes.Target, spec: sdk.spec} as Target

export type OCRRegion = eyes.OCRRegion<SpecType>

export type ConfigurationPlain = eyes.ConfigurationPlain<SpecType>
export class Configuration extends eyes.Configuration<SpecType> {
  protected static readonly _spec = sdk.spec
}

export class BatchClose extends eyes.BatchClose {
  protected static readonly _sdk = sdk
}
export const closeBatch = eyes.closeBatch(sdk)
