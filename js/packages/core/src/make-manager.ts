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
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
  core?: BaseCore
  concurrency?: number
  agentId?: string
  cwd?: string
  logger?: Logger
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
    const storage = [] as {eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>; promise?: Promise<TestResult<TType>[]>}[]
    // open eyes with result storage
    const openEyes = utils.general.wrap(makeOpenEyes({type, batch, spec, core, cores, logger}), async (openEyes, options) => {
      const eyes = await openEyes(options)
      const item = {eyes} as typeof storage[number]
      storage.push(item)
      return utils.general.extend(eyes, {
        close(options) {
          const promise = eyes.close(options)
          item.promise ??= promise
          return promise
        },
        checkAndClose(options) {
          const promise = eyes.checkAndClose(options)
          item.promise ??= promise
          return promise
        },
        abort(options) {
          const promise = eyes.abort(options)
          item.promise ??= promise
          return promise
        },
      })
    })

    return {
      openEyes,
      closeManager: makeCloseManager({core, storage, logger}),
    }
  }
}
