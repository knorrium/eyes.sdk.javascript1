import type {Core} from './types'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore, type Core as BaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from '../automation/get-viewport-size'
import {makeSetViewportSize} from '../automation/set-viewport-size'
import {makeLocate} from '../automation/locate'
import {makeLocateText} from '../automation/locate-text'
import {makeExtractText} from '../automation/extract-text'
import {makeOpenEyes} from './open-eyes'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  base?: BaseCore
  agentId?: string
  cwd?: string
  logger?: Logger
}

export function makeCore<TSpec extends SpecType>({
  spec,
  base,
  agentId = 'core-classic',
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TSpec>): Core<TSpec> {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'core-classic'}})
  logger.log(`Core classic is initialized ${base ? 'with' : 'without'} custom base core`)

  base ??= makeBaseCore({agentId, cwd, logger})
  return utils.general.extend(base, core => {
    return {
      type: 'classic' as const,
      base: base!,
      getViewportSize: spec && makeGetViewportSize({spec, logger}),
      setViewportSize: spec && makeSetViewportSize({spec, logger}),
      locate: makeLocate({spec, core, logger}),
      locateText: makeLocateText({spec, core, logger}),
      extractText: makeExtractText({spec, core, logger}),
      openEyes: makeOpenEyes({spec, core, logger}),
    }
  })
}
