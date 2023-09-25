import type {MaybeArray} from '@applitools/utils'
import type {Target, Core, ExtractTextSettings, Config} from './types'
import {type Logger} from '@applitools/logger'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeCore as makeClassicCore} from './classic/core'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  core: Core<TSpec>
  logger: Logger
}

export function makeExtractText<TSpec extends SpecType>({spec, core, logger: mainLogger}: Options<TSpec>) {
  return async function extractText({
    target,
    settings,
    config,
    logger = mainLogger,
  }: {
    target: Target<TSpec, 'classic'>
    settings: MaybeArray<ExtractTextSettings<TSpec>>
    config?: Config<TSpec, 'classic'>
    logger?: Logger
  }): Promise<string[]> {
    logger = logger.extend(mainLogger, {tags: [`extract-text-${utils.general.shortid()}`]})

    settings = utils.types.isArray(settings) ? settings : [settings]
    settings = settings.map(settings => {
      settings = {...config?.open, ...config?.screenshot, ...settings}
      settings.userCommandId ??= `extract-text--${utils.general.guid()}`
      settings.eyesServerUrl ??=
        (settings as any).serverUrl ??
        utils.general.getEnvValue('EYES_SERVER_URL') ??
        utils.general.getEnvValue('SERVER_URL') ??
        'https://eyesapi.applitools.com'
      settings.apiKey ??= utils.general.getEnvValue('API_KEY')
      return settings
    })

    const classicCore = makeClassicCore({spec, base: core.base, logger})
    const results = await classicCore.extractText({target, settings, logger})
    return results
  }
}
