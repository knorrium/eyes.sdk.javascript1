import type {OpenSettings} from './types'
import type {Core as CoreBase, Eyes as EyesBase} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type UFGClient, type Renderer} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

type Options = {
  settings?: OpenSettings
  eyes?: EyesBase[]
  core?: CoreBase
  client?: UFGClient
  logger?: Logger
}

export function makeGetBaseEyes({settings: defaultSettings, core, client, eyes, logger: defaultLogger}: Options) {
  const getBaseEyesWithCache = utils.general.cachify(getBaseEyes, ([options]) => options?.settings)
  if (eyes) eyes.forEach(eyes => getBaseEyesWithCache.setCachedValue(eyes.test.rendererInfo, Promise.resolve([eyes])))
  return getBaseEyesWithCache

  async function getBaseEyes({
    settings,
    logger = defaultLogger,
  }: {
    settings?: {type: 'web' | 'native'; renderer: Renderer}
    logger?: Logger
  } = {}): Promise<EyesBase[]> {
    logger.log(`Command "getBaseEyes" is called with settings`, settings)
    const environment = await client.bookRenderer({settings})
    const eyes = await core.openEyes({
      settings: {...defaultSettings, environment: {...defaultSettings.environment, ...environment}},
      logger,
    })
    return [eyes]
  }
}
