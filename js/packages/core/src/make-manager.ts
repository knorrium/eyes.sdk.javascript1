import type {Batch, EyesManager, Eyes, TestResult} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type SpecDriver} from '@applitools/driver'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeCore as makeClassicCore} from './classic/core'
import {makeCore as makeUFGCore} from './ufg/core'
import {makeOpenEyes} from './open-eyes'
import {makeCloseManager} from './close-manager'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  core?: BaseCore
  concurrency?: number
  agentId?: string
  cwd?: string
  logger: Logger
}

export function makeMakeManager<TDriver, TContext, TElement, TSelector>({
  spec,
  core,
  concurrency: defaultConcurrency = utils.general.getEnvValue('CONCURRENCY', 'number'),
  agentId: defaultAgentId,
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
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
  } = {}): Promise<EyesManager<TDriver, TContext, TElement, TSelector, TType>> {
    concurrency ??= utils.types.isInteger(legacyConcurrency) ? legacyConcurrency * 5 : 5
    batch ??= {}
    batch.id ??= `generated-${utils.general.guid()}`
    core ??= makeBaseCore({agentId, cwd, logger})
    const cores = {
      ufg: makeUFGCore({spec, core, concurrency, logger}),
      classic: makeClassicCore({spec, core, logger}),
    }
    const storage = [] as {
      eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>
      promise?: Promise<TestResult<TType>[]>
    }[]
    return {
      openEyes: utils.general.wrap(
        makeOpenEyes({type, batch, spec, core, cores, logger}),
        async (openEyes, options) => {
          const eyes = await openEyes(options)
          const item = {eyes} as (typeof storage)[number]
          storage.push(item)
          return utils.general.extend(eyes, {
            checkAndClose: utils.general.wrap(eyes.checkAndClose, (checkAndClose, options?) => {
              const promise = checkAndClose(options)
              item.promise ??= promise
              return promise
            }),
            close: utils.general.wrap(eyes.close, (close, options?) => {
              const promise = close(options)
              item.promise ??= promise
              return promise
            }),
            abort: utils.general.wrap(eyes.abort, (abort, options?) => {
              const promise = abort(options)
              item.promise ??= promise
              return promise
            }),
          })
        },
      ),
      closeManager: makeCloseManager({core, storage, logger}),
    }
  }
}
