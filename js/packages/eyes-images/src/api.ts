import * as eyes from '@applitools/eyes'

export * from '@applitools/eyes'

const sdk = {agentId: `eyes.images.javascript/${require('../package.json').version}`}

export class Eyes extends eyes.Eyes<never> {
  protected static readonly _sdk = sdk
}

export type ConfigurationPlain = eyes.ConfigurationPlain<never>
export class Configuration extends eyes.Configuration<never> {}

export type CheckSettingsAutomationPlain = eyes.CheckSettingsAutomationPlain<never>
export class CheckSettingsAutomation extends eyes.CheckSettingsAutomation<never> {}
export class CheckSettingsImage extends eyes.CheckSettingsImage {}
export class CheckSettings extends CheckSettingsImage {}

export type TargetAutomation = eyes.TargetAutomation<never>
export const Target = eyes.TargetImage

export type OCRRegion = eyes.OCRRegion<never>

export class BatchClose extends eyes.BatchClose {
  protected static readonly _sdk = sdk
}
export const closeBatch = eyes.closeBatch(sdk)
