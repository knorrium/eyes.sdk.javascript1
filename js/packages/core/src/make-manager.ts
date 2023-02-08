import type {Batch, EyesManager, Eyes} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
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
  core?: BaseCore
  concurrency?: number
  agentId?: string
  cwd?: string
  logger: Logger
}

export function makeMakeManager<TSpec extends SpecType>({
  spec,
  core,
  concurrency: defaultConcurrency = utils.general.getEnvValue('CONCURRENCY', 'number'),
  agentId: defaultAgentId,
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TSpec>) {
  return async function makeManager<TType extends 'classic' | 'ufg' = 'classic'>({
    type = 'classic' as TType,
    concurrency = defaultConcurrency,
    legacyConcurrency,
    batch,
    agentId = type === 'ufg' ? defaultAgentId?.replace(/(\/\d)/, '.visualgrid$1') : defaultAgentId,
    logger = defaultLogger,
  }: {
    type?: TType
    concurrency?: number
    /** @deprecated */
    legacyConcurrency?: number
    batch?: Batch
    agentId?: string
    logger?: Logger
  } = {}): Promise<EyesManager<TSpec, TType>> {
    concurrency ??= utils.types.isInteger(legacyConcurrency) ? legacyConcurrency * 5 : 5
    batch ??= {}
    batch.id ??= `generated-${utils.general.guid()}`
    core ??= makeBaseCore({agentId, cwd, logger})
    const cores = {ufg: makeUFGCore({spec, core, concurrency, logger}), classic: makeClassicCore({spec, core, logger})}
    const storage = [] as Eyes<TSpec, TType>[]
    return {
      openEyes: utils.general.wrap(
        makeOpenEyes({type, batch, spec, core, cores, logger}),
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
