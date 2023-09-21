import type {Core} from './types'
import {type AsyncCache, type UFGClient} from '@applitools/ufg-client'
import {type NMLClient} from '@applitools/nml-client'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore, type Core as BaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from '../automation/get-viewport-size'
import {makeSetViewportSize} from '../automation/set-viewport-size'
import {makeLocate} from '../automation/locate'
import {makeLocateText} from '../automation/locate-text'
import {makeExtractText} from '../automation/extract-text'
import {makeGetNMLClient} from '../automation/get-nml-client'
import {makeGetUFGClient} from './get-ufg-client'
import {makeOpenEyes} from './open-eyes'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  clients?: {ufg?: UFGClient; nml?: NMLClient}
  base?: BaseCore
  concurrency?: number
  fetchConcurrency?: number
  agentId?: string
  cwd?: string
  logger?: Logger
  asyncCache?: AsyncCache
}

export function makeCore<TSpec extends SpecType = never>({
  spec,
  clients,
  base,
  concurrency,
  fetchConcurrency,
  agentId = 'core-ufg',
  cwd = process.cwd(),
  logger: defaultLogger,
  asyncCache,
}: Options<TSpec>): Core<TSpec> {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'core-ufg'}})
  logger.log(`Core ufg is initialized ${base ? 'with' : 'without'} custom base core`)

  base ??= makeBaseCore({concurrency, agentId, cwd, logger})
  return utils.general.extend(base, core => {
    return {
      type: 'ufg' as const,
      base: base!,
      getViewportSize: spec && makeGetViewportSize({spec, logger}),
      setViewportSize: spec && makeSetViewportSize({spec, logger}),
      locate: makeLocate({spec, core, logger}),
      locateText: makeLocateText({spec, core, logger}),
      extractText: makeExtractText({spec, core, logger}),
      getUFGClient: makeGetUFGClient({client: clients?.ufg, fetchConcurrency, asyncCache, logger}),
      getNMLClient: makeGetNMLClient({client: clients?.nml, logger}),
      openEyes: makeOpenEyes({spec, core, logger}),
    }
  })
}
