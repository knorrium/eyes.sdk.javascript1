import type {Core} from './types'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore, type Core as BaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from '../automation/get-viewport-size'
import {makeSetViewportSize} from '../automation/set-viewport-size'
import {makeLocate} from '../automation/locate'
import {makeOpenEyes} from './open-eyes'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  core?: BaseCore
  agentId?: string
  cwd?: string
  logger?: Logger
}

export function makeCore<TSpec extends SpecType>({
  spec,
  core,
  agentId = 'core-classic',
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TSpec>): Core<TSpec> {
  const logger = defaultLogger?.extend({label: 'core-classic'}) ?? makeLogger({label: 'core-classic'})
  logger.log(`Core classic is initialized ${core ? 'with' : 'without'} custom base core`)
  core ??= makeBaseCore({agentId, cwd, logger})
  return utils.general.extend(core, {
    type: 'classic' as const,
    isDriver: spec && spec.isDriver,
    isElement: spec && spec.isElement,
    isSelector: spec && spec.isSelector,
    getViewportSize: spec && makeGetViewportSize({spec, logger}),
    setViewportSize: spec && makeSetViewportSize({spec, logger}),
    locate: makeLocate({spec, core, logger}),
    openEyes: makeOpenEyes({spec, core, logger}),
  })
}
