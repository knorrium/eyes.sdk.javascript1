import type {SpecType as BaseSpecType} from '@applitools/driver'
import type {SpecDriver} from '@applitools/driver'
import {extractEnvironment} from './extract-environment'
import * as eyes from '@applitools/eyes'
import * as spec from './spec-driver'

export * from '@applitools/eyes'

export type Driver = spec.NWDriver
export type Element = spec.NWElement | spec.NWResponseElement
export type Selector = spec.NWSelector
export type SpecType = BaseSpecType<Driver, Driver, Element, Selector>

const environment = extractEnvironment()
const sdk = {spec, agentId: `eyes.nightwatch/${require('../package.json').version}`, environment}

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
export const TargetAutomation = {
  ...eyes.TargetAutomation,
  spec: spec as unknown as SpecDriver<SpecType>,
} as TargetAutomation
export const Target = {...eyes.Target, spec: spec as unknown as SpecDriver<SpecType>} as eyes.Target<SpecType>

export type OCRRegion = eyes.OCRRegion<SpecType>

export type ConfigurationPlain = eyes.ConfigurationPlain<SpecType>
export class Configuration extends eyes.Configuration<SpecType> {
  protected static readonly _spec = spec
}

export class BatchClose extends eyes.BatchClose {
  protected static readonly _sdk = sdk
}
export const closeBatch = eyes.closeBatch(sdk)
