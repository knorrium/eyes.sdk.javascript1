import type {Core} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from './automation/get-viewport-size'
import {makeSetViewportSize} from './automation/set-viewport-size'
import {makeLocate} from './locate'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeOpenEyes} from './open-eyes'
import {makeMakeManager} from './make-manager'
import {makeCloseBatch} from './close-batch'
import {makeDeleteTest} from './delete-test'
import {makeMakeECClient} from './make-ec-client'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  concurrency?: number
  core?: BaseCore
  agentId?: string
  cwd?: string
  logger?: Logger
}

export function makeCore<TSpec extends SpecType>({
  spec,
  concurrency,
  core,
  agentId = 'core',
  cwd = process.cwd(),
  logger,
}: Options<TSpec> = {}): Core<TSpec, 'classic' | 'ufg'> {
  logger = logger?.extend({label: 'core'}) ?? makeLogger({label: 'core'})
  logger.log(`Core is initialized ${core ? 'with' : 'without'} custom base core`)
  core ??= makeBaseCore({agentId, cwd, logger})

  return utils.general.extend(core, {
    isDriver: spec && spec.isDriver,
    isElement: spec && spec.isElement,
    isSelector: spec && spec.isSelector,
    getViewportSize: spec && makeGetViewportSize({spec, logger}),
    setViewportSize: spec && makeSetViewportSize({spec, logger}),
    locate: makeLocate({spec, core, logger}),
    locateText: makeLocateText({spec, core, logger}),
    extractText: makeExtractText({spec, core, logger}),
    openEyes: makeOpenEyes({spec, core, concurrency, logger}),
    makeManager: makeMakeManager({spec, concurrency, agentId, logger}),
    closeBatch: makeCloseBatch({core, logger}),
    deleteTest: makeDeleteTest({core, logger}),
    makeECClient: makeMakeECClient({core, logger}),
  })
}
