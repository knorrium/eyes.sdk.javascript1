import type {Core, EyesManager, Eyes, ManagerSettings} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type AsyncCache, type UFGClient} from '@applitools/ufg-client'
import {type NMLClient} from '@applitools/nml-client'
import {type Logger} from '@applitools/logger'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeCore as makeClassicCore} from './classic/core'
import {makeCore as makeUFGCore} from './ufg/core'
import {makeOpenEyes} from './open-eyes'
import {makeGetManagerResults} from './get-manager-results'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  clients?: {ufg?: UFGClient; nml?: NMLClient}
  concurrency?: number
  core: Core<TSpec>
  base?: BaseCore
  agentId?: string
  environment?: Record<string, any>
  cwd?: string
  logger: Logger
  asyncCache?: AsyncCache
}

export function makeMakeManager<TSpec extends SpecType>({
  spec,
  clients,
  concurrency: defaultConcurrency = utils.general.getEnvValue('CONCURRENCY', 'number'),
  core,
  base,
  agentId: defaultAgentId,
  environment,
  cwd = process.cwd(),
  logger: mainLogger,
  asyncCache,
}: Options<TSpec>) {
  return async function makeManager<TType extends 'classic' | 'ufg' = 'classic'>({
    type = 'classic' as TType,
    settings,
    logger = mainLogger,
  }: {
    type?: TType
    settings?: ManagerSettings
    logger?: Logger
  } = {}): Promise<EyesManager<TSpec, TType>> {
    logger = logger.extend(mainLogger, {tags: [`manager-${type}-${utils.general.shortid()}`]})

    settings ??= {}
    settings.concurrency ??=
      defaultConcurrency ?? (utils.types.isInteger(settings.legacyConcurrency) ? settings.legacyConcurrency * 5 : 5)
    settings.batch ??= {}
    settings.batch.id ??= utils.general.getEnvValue('BATCH_ID') ?? `generated-${utils.general.guid()}`
    settings.agentId ??= type === 'ufg' ? defaultAgentId?.replace(/(\/\d)/, '.visualgrid$1') : defaultAgentId

    logger.log('Command "makeManager" is called with settings', settings)

    base ??= makeBaseCore({agentId: settings.agentId, concurrency: settings.concurrency, cwd, logger})
    const cores = {
      ufg: makeUFGCore({spec, base, fetchConcurrency: settings.fetchConcurrency, asyncCache, logger}),
      classic: makeClassicCore({spec, base, logger}),
    }
    const storage = [] as Eyes<TSpec, TType>[]
    return {
      openEyes: utils.general.wrap(
        makeOpenEyes({type, clients, batch: settings.batch, spec, core, cores, environment, asyncCache, logger}),
        async (openEyes, options) => {
          const eyes = await openEyes(options)
          storage.push(eyes)
          return eyes
        },
      ),
      getResults: makeGetManagerResults({core, storage, logger}),
    }
  }
}
