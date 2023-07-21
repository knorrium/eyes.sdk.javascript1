import type {DriverTarget, Core, Eyes, OpenSettings, VisualTest} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type Renderer} from '@applitools/ufg-client'
import {makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {makeGetBaseEyes} from './get-base-eyes'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeClose} from './close'
import {makeAbort} from './abort'
import {makeGetResults} from './get-results'
import {AbortController} from 'abort-controller'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  core: Core<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeOpenEyes<TSpec extends SpecType>({core, spec, logger: mainLogger}: Options<TSpec>) {
  return async function openEyes({
    target,
    settings,
    base,
    logger = mainLogger,
  }: {
    target?: DriverTarget<TSpec>
    settings: OpenSettings
    base?: BaseEyes[]
    logger?: Logger
  }): Promise<Eyes<TSpec>> {
    logger = logger.extend(mainLogger)

    logger.log(
      `Command "openEyes" is called with ${target ? 'default driver and' : ''}`,
      ...(settings ? ['settings', settings] : []),
      base ? 'predefined eyes' : '',
    )
    const driver = target && (await makeDriver({spec, driver: target, logger}))
    if (driver && !base) {
      const environment = await driver?.getEnvironment()
      const currentContext = driver.currentContext
      settings.environment ??= {}
      if (environment.isEC) {
        settings.environment.ecSessionId = (await driver.getSessionId()) ?? undefined
      }
      if (settings.environment.viewportSize) {
        await driver.setViewportSize(settings.environment.viewportSize)
      }
      await currentContext.focus()
    }
    const controller = new AbortController()
    const account = await core.getAccountInfo({settings, logger})
    return utils.general.extend({}, eyes => {
      const storage = new Map<string, Promise<{renderer: Renderer; eyes: BaseEyes}>[]>()
      let running = true
      return {
        type: 'ufg' as const,
        core,
        test: {
          userTestId: settings.userTestId,
          batchId: settings.batch?.id,
          keepBatchOpen: settings.keepBatchOpen,
          eyesServer: account.eyesServer,
          ufgServer: account.ufgServer,
          uploadUrl: account.uploadUrl,
          stitchingServiceUrl: account.stitchingServiceUrl,
          account,
        } as VisualTest,
        get running() {
          return running
        },
        getBaseEyes: makeGetBaseEyes({settings, eyes, base, logger}),
        // check with indexing and storage
        check: makeCheck({eyes, storage, target: driver, spec, signal: controller.signal, logger}),
        checkAndClose: makeCheckAndClose({eyes, storage, target: driver, spec, signal: controller.signal, logger}),
        close: utils.general.wrap(makeClose({storage, target: driver, logger}), async (close, options) => {
          if (!running) return
          running = false
          return close(options)
        }),
        abort: utils.general.wrap(
          makeAbort({storage, target: driver, spec, controller, logger}),
          async (abort, options) => {
            if (!running) return
            running = false
            return abort(options)
          },
        ),
        getResults: makeGetResults({storage, logger}),
      }
    })
  }
}
