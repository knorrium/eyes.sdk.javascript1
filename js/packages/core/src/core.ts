import type {Core} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type UFGClient} from '@applitools/ufg-client'
import {type NMLClient} from '@applitools/nml-client'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from './automation/get-viewport-size'
import {makeSetViewportSize} from './automation/set-viewport-size'
import {makeGetAccountInfo} from './get-account-info'
import {makeGetNMLClient} from './automation/get-nml-client'
import {makeGetECClient} from './get-ec-client'
import {makeLocate} from './locate'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeOpenEyes} from './open-eyes'
import {makeMakeManager} from './make-manager'
import {makeCloseBatch} from './close-batch'
import {makeDeleteTest} from './delete-test'
import {extractEnvironment} from './utils/extract-environment'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  spec?: SpecDriver<TSpec>
  clients?: {ufg?: UFGClient; nml?: NMLClient}
  concurrency?: number
  base?: BaseCore
  agentId?: string
  environment?: Record<string, any>
  cwd?: string
  logger?: Logger
}

export function makeCore<TSpec extends SpecType>({
  spec,
  clients,
  concurrency,
  base: defaultBase,
  environment: defaultEnvironment,
  agentId = 'core',
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TSpec> = {}): Core<TSpec, 'classic' | 'ufg'> {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'core'}})
  const environment = extractEnvironment(defaultEnvironment)
  logger.log(`Core is initialized ${defaultBase ? 'with' : 'without'} custom base core and environment`, environment)

  const base = defaultBase ?? makeBaseCore({agentId, cwd, logger})
  return utils.general.extend(base, core => {
    return {
      base: base!,
      getViewportSize: spec && makeGetViewportSize({spec, logger}),
      setViewportSize: spec && makeSetViewportSize({spec, logger}),
      getNMLClient: makeGetNMLClient({client: clients?.nml, logger}),
      getECClient: makeGetECClient({logger}),
      getAccountInfo: makeGetAccountInfo({core, logger}),
      makeManager: makeMakeManager({spec, clients, concurrency, core, base: defaultBase, agentId, environment, logger}),
      locate: makeLocate({spec, core, logger}),
      locateText: makeLocateText({spec, core, logger}),
      extractText: makeExtractText({spec, core, logger}),
      openEyes: makeOpenEyes({spec, clients, core, concurrency, environment, logger}),
      closeBatch: makeCloseBatch({core, logger}),
      deleteTest: makeDeleteTest({core, logger}),
    }
  })
}
