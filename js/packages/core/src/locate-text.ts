import type {Core, Target, LocateTextSettings, Config, LocateTextResult} from './types'
import {type Logger} from '@applitools/logger'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeCore as makeClassicCore} from './classic/core'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  core: Core<TSpec>
  logger: Logger
}

export function makeLocateText<TSpec extends SpecType>({spec, core, logger: defaultLogger}: Options<TSpec>) {
  return async function locateText<TPattern extends string>({
    target,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target: Target<TSpec, 'classic'>
    settings: LocateTextSettings<TPattern, TSpec>
    config?: Config<TSpec, 'classic'>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    settings = {...config?.open, ...config?.screenshot, ...settings}
    settings.serverUrl ??= utils.general.getEnvValue('SERVER_URL') ?? 'https://eyesapi.applitools.com'
    settings.apiKey ??= utils.general.getEnvValue('API_KEY')

    const classicCore = makeClassicCore({spec, base: core.base, logger})
    const results = await classicCore.locateText({target, settings, logger})
    return results
  }
}
