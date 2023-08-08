import {extractEnvironment} from './extract-environment'
import * as eyes from '@applitools/eyes'
import * as spec from '@applitools/spec-driver-webdriverio'

export * from '@applitools/eyes'
export * from './legacy'

export type Driver = spec.Driver
export type Element = spec.Element
export type Selector = spec.Selector
export type SpecType = spec.SpecType

const environment = extractEnvironment()
const sdk = {spec, agentId: `eyes-webdriverio/${require('../package.json').version}`, environment}

export class Eyes extends eyes.Eyes<SpecType> {
  protected static readonly _sdk = sdk
  static setViewportSize: (driver: Driver, viewportSize: eyes.RectangleSize) => Promise<void>
}

export type CheckSettingsAutomationPlain = eyes.CheckSettingsAutomationPlain<SpecType>
export class CheckSettingsAutomation extends eyes.CheckSettingsAutomation<SpecType> {
  protected static readonly _spec = spec
}
export class CheckSettings extends CheckSettingsAutomation {}

export type TargetAutomation = eyes.TargetAutomation<SpecType>
export const TargetAutomation = {...eyes.TargetAutomation, spec} as TargetAutomation
export const Target = {...eyes.Target, spec} as eyes.Target<SpecType>

export type OCRRegion = eyes.OCRRegion<SpecType>

export type ConfigurationPlain = eyes.ConfigurationPlain<SpecType>
export class Configuration extends eyes.Configuration<SpecType> {
  protected static readonly _spec = spec
}

export class BatchClose extends eyes.BatchClose {
  protected static readonly _sdk = sdk
}
export const closeBatch = eyes.closeBatch(sdk)
