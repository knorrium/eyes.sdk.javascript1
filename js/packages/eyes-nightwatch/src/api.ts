import type {SpecType as BaseSpecType} from '@applitools/driver'
import {makeCore} from '@applitools/core'
import * as api from '@applitools/eyes-api'
import * as spec from './spec-driver'

const sdk = makeCore({
  agentId: `eyes.nightwatch/${require('../package.json').version}`,
  spec,
})

export * from '@applitools/eyes-api'

export type Driver = spec.NWDriver
export type Element = spec.NWElement | spec.NWResponseElement
export type Selector = spec.NWSelector
export type SpecType = BaseSpecType<Driver, Driver, Element, Selector>

export class Eyes extends api.Eyes<SpecType> {
  protected static readonly _spec = sdk
  static setViewportSize: (driver: Driver, viewportSize: api.RectangleSize) => Promise<void>
}

export type ConfigurationPlain = api.ConfigurationPlain<SpecType>

export class Configuration extends api.Configuration<SpecType> {
  protected static readonly _spec = sdk
}

export type OCRRegion = api.OCRRegion<SpecType>

export type CheckSettingsAutomationPlain = api.CheckSettingsAutomationPlain<SpecType>

export class CheckSettingsAutomation extends api.CheckSettingsAutomation<SpecType> {
  protected static readonly _spec = sdk
}

export class CheckSettings extends CheckSettingsAutomation {}

export const Target = {...api.Target, spec: sdk} as api.Target<SpecType>

export class BatchClose extends api.BatchClose {
  protected static readonly _spec = sdk
}

export const closeBatch = api.closeBatch(sdk)
