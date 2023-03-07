import type {DriverTarget, Eyes, OpenSettings, TestInfo} from './types'
import type {Core as BaseCore, Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type UFGClient, type Renderer} from '@applitools/ufg-client'
import {type NMLClient} from '@applitools/nml-client'
import {makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {makeGetUFGClient} from './get-ufg-client'
import {makeGetNMLClient} from './get-nml-client'
import {makeGetBaseEyes} from './get-base-eyes'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeClose} from './close'
import {makeAbort} from './abort'
import {makeGetResults} from './get-results'
import {AbortController} from 'abort-controller'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  core: BaseCore
  clients?: {ufg: UFGClient; nml: NMLClient}
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeOpenEyes<TSpec extends SpecType>({core, clients, spec, logger: defaultLogger}: Options<TSpec>) {
  return async function openEyes({
    target,
    settings,
    eyes,
    logger = defaultLogger,
  }: {
    target?: DriverTarget<TSpec>
    settings: OpenSettings
    eyes?: BaseEyes[]
    logger?: Logger
  }): Promise<Eyes<TSpec>> {
    logger.log(
      `Command "openEyes" is called with ${target ? 'default driver and' : ''}`,
      ...(settings ? ['settings', settings] : []),
      eyes ? 'predefined eyes' : '',
    )
    const driver = target && (await makeDriver({spec, driver: target, logger}))
    if (driver && !eyes) {
      const currentContext = driver.currentContext
      settings.environment ??= {}
      if (driver.isEC) {
        settings.environment.ecSessionId = driver.sessionId
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
        test: <TestInfo>{
          userTestId: settings.userTestId,
          batchId: settings.batch?.id,
          keepBatchOpen: settings.keepBatchOpen,
          server: {serverUrl: settings.serverUrl, apiKey: settings.apiKey, proxy: settings.proxy},
          account,
        },
        get running() {
          return running
        },
        getUFGClient: makeGetUFGClient({
          config: {...account.ufg, ...account, proxy: settings.proxy},
          concurrency: settings.renderConcurrency ?? 5,
          client: clients?.ufg,
          logger,
        }),
        getNMLClient: makeGetNMLClient({config: settings, client: clients?.nml, logger}),
        getBaseEyes: makeGetBaseEyes({eyes, settings, core, logger}),
        // check with indexing and storage
        check: utils.general.wrap(
          makeCheck({eyes, target: driver, spec, signal: controller.signal, logger}),
          async (check, options = {}) => {
            const results = await check(options)
            results.forEach(result => {
              const key = JSON.stringify(result.renderer)
              storage.set(key, [...(storage.get(key) ?? ([] as any[])), result.promise])
            })
            return results
          },
        ),
        checkAndClose: utils.general.wrap(
          makeCheckAndClose({eyes, target: driver, spec, signal: controller.signal, logger}),
          async (checkAndClose, options = {}) => {
            const results = await checkAndClose(options)
            results.forEach(result => {
              const key = JSON.stringify(result.renderer)
              storage.set(key, [...(storage.get(key) ?? ([] as any[])), {eyes: result.eyes, renderer: result.renderer}])
            })
            return results
          },
        ),
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
