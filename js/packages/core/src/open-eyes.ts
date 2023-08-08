import type {DriverTarget, Core, TypedCore, Batch, Eyes, Config, OpenSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {makeCore as makeClassicCore} from './classic/core'
import {makeCore as makeUFGCore} from './ufg/core'
import {makeGetTypedEyes} from './get-typed-eyes'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeClose} from './close'
import {makeGetEyesResults} from './get-eyes-results'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  type?: TType
  concurrency?: number
  batch?: Batch
  core: Core<TSpec, TType>
  cores?: {[TKey in 'classic' | 'ufg']: TypedCore<TSpec, TKey>}
  spec?: SpecDriver<TSpec>
  environment?: Record<string, any>
  logger: Logger
}

export function makeOpenEyes<TSpec extends SpecType, TDefaultType extends 'classic' | 'ufg' = 'classic'>({
  type: defaultType = 'classic' as TDefaultType,
  concurrency,
  batch,
  core,
  cores,
  spec,
  environment,
  logger: mainLogger,
}: Options<TSpec, TDefaultType>) {
  return async function openEyes<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as unknown as TType,
    settings,
    config,
    target,
    logger = mainLogger,
  }: {
    type?: TType
    settings?: Partial<OpenSettings<TDefaultType> & OpenSettings<TType>>
    config?: Config<TSpec, TDefaultType> & Config<TSpec, TType>
    target?: DriverTarget<TSpec>
    logger?: Logger
  }): Promise<Eyes<TSpec, TType>> {
    logger = logger.extend(mainLogger, {tags: [`eyes-${type}-${utils.general.shortid()}`]})

    settings = {...config?.open, ...settings} as Partial<OpenSettings<TDefaultType> & OpenSettings<TType>>
    settings.userTestId ??= `${settings.testName}--${utils.general.guid()}`
    settings.eyesServerUrl ??=
      ((settings as any).serverUrl as string) ??
      utils.general.getEnvValue('EYES_SERVER_URL') ??
      utils.general.getEnvValue('SERVER_URL') ??
      'https://eyesapi.applitools.com'
    settings.apiKey ??= utils.general.getEnvValue('API_KEY')
    settings.useDnsCache ??= utils.general.getEnvValue('USE_DNS_CACHE', 'boolean')
    settings.batch = {...batch, ...settings.batch}
    settings.batch.id ??= utils.general.getEnvValue('BATCH_ID') ?? `generated-${utils.general.guid()}`
    settings.batch.name ??= utils.general.getEnvValue('BATCH_NAME')
    settings.batch.sequenceName ??= utils.general.getEnvValue('BATCH_SEQUENCE')
    settings.batch.notifyOnCompletion ??= utils.general.getEnvValue('BATCH_NOTIFY', 'boolean')
    settings.keepBatchOpen ??= utils.general.getEnvValue('DONT_CLOSE_BATCHES', 'boolean')
    settings.branchName ??= utils.general.getEnvValue('BRANCH')
    settings.parentBranchName ??= utils.general.getEnvValue('PARENT_BRANCH')
    settings.baselineBranchName ??= utils.general.getEnvValue('BASELINE_BRANCH')
    settings.ignoreBaseline ??= false
    settings.compareWithParentBranch ??= false

    const driver =
      target && (await makeDriver({spec, driver: target, logger, customConfig: settings as OpenSettings<'classic'>}))

    core.logEvent({
      settings: {
        ...(settings as OpenSettings<'ufg' | 'classic'>),
        level: 'Notice',
        event: {
          type: 'openEyes',
          environment,
          concurrency,
          driverUrl: await driver?.getDriverUrl(),
        },
      },
      logger,
    })

    const getTypedEyes = makeGetTypedEyes({
      type,
      settings: settings as OpenSettings<TType>,
      target: driver,
      cores: cores ?? {
        ufg: makeUFGCore({spec, base: core.base, concurrency: concurrency ?? 5, logger}),
        classic: makeClassicCore({spec, base: core.base, logger}),
      },
      logger,
    })
    const eyes = await getTypedEyes({logger})
    return utils.general.extend(eyes, eyes => ({
      getTypedEyes,
      check: makeCheck({type, eyes, target: driver, spec, logger}),
      checkAndClose: makeCheckAndClose({type, eyes, target: driver, spec, logger}),
      close: makeClose({eyes, logger}),
      getResults: makeGetEyesResults({eyes, logger}),
    })) as unknown as Eyes<TSpec, TType> // TODO solve the types issue
  }
}
