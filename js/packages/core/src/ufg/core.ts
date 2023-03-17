import type {Core} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type UFGClient} from '@applitools/ufg-client'
import {type NMLClient} from '@applitools/nml-client'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from '../automation/get-viewport-size'
import {makeSetViewportSize} from '../automation/set-viewport-size'
import {makeLocate} from '../automation/locate'
import {makeLocateText} from '../automation/locate-text'
import {makeExtractText} from '../automation/extract-text'
import {makeGetUFGClient} from './get-ufg-client'
import {makeGetNMLClient} from './get-nml-client'
import {makeOpenEyes} from './open-eyes'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  clients?: {ufg?: UFGClient; nml?: NMLClient}
  base?: BaseCore
  agentId?: string
  concurrency?: number
  cwd?: string
  logger?: Logger
}

export function makeCore<TSpec extends SpecType>({
  concurrency,
  spec,
  clients,
  base,
  agentId = 'core-ufg',
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TSpec>): Core<TSpec> {
  const logger = defaultLogger?.extend({label: 'core-ufg'}) ?? makeLogger({label: 'core-ufg'})
  logger.log(`Core ufg is initialized ${base ? 'with' : 'without'} custom base core`)

  base ??= makeBaseCore({agentId, concurrency, cwd, logger})
  return utils.general.extend(base, core => {
    return {
      type: 'ufg' as const,
      base: base!,
      getViewportSize: spec && makeGetViewportSize({spec, logger}),
      setViewportSize: spec && makeSetViewportSize({spec, logger}),
      locate: makeLocate({spec, core, logger}),
      locateText: makeLocateText({spec, core, logger}),
      extractText: makeExtractText({spec, core, logger}),
      getUFGClient: makeGetUFGClient({client: clients?.ufg, logger}),
      getNMLClient: makeGetNMLClient({client: clients?.nml, logger}),
      openEyes: makeOpenEyes({spec, core, logger}),
    }
  })
}
