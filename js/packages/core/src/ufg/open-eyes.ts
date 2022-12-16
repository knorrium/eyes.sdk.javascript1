import type {DriverTarget, Eyes, OpenSettings, TestInfo} from './types'
import type {Core as BaseCore, Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecDriver} from '@applitools/driver'
import {makeUFGClient, type UFGClient} from '@applitools/ufg-client'
import {makeGetBaseEyes} from './get-base-eyes'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeClose} from './close'
import {makeAbort} from './abort'
import {AbortController} from 'abort-controller'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  core: BaseCore
  client?: UFGClient
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger?: Logger
}

export function makeOpenEyes<TDriver, TContext, TElement, TSelector>({
  core,
  client,
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function openEyes({
    target,
    settings,
    eyes,
    logger = defaultLogger,
  }: {
    target?: DriverTarget<TDriver, TContext, TElement, TSelector>
    settings: OpenSettings
    eyes?: BaseEyes[]
    logger?: Logger
  }): Promise<Eyes<TDriver, TContext, TElement, TSelector>> {
    logger.log(
      `Command "openEyes" is called with ${target ? 'default driver and' : ''}`,
      ...(settings ? ['settings', settings] : []),
      eyes ? 'predefined eyes' : '',
    )
    const driver = target && (await makeDriver({spec, driver: target, logger, customConfig: {disableHelper: true}}))
    if (driver && !eyes) {
      const currentContext = driver.currentContext
      if (settings.environment?.viewportSize) {
        await driver.setViewportSize(settings.environment.viewportSize)
      }
      await currentContext.focus()
    }
    const controller = new AbortController()
    const account = await core.getAccountInfo({settings, logger})
    client ??= makeUFGClient({
      config: {...account.ufg, ...account, proxy: settings.proxy},
      concurrency: settings.renderConcurrency ?? 5,
      logger,
    })

    const getBaseEyes = makeGetBaseEyes({settings, eyes, core, client, logger})

    return utils.general.extend({}, eyes => {
      const storage = []
      let stepIndex = 0
      let closed = false
      let aborted = false

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
          return !closed && !aborted
        },
        get closed() {
          return closed
        },
        get aborted() {
          return aborted
        },
        getBaseEyes,
        // check with indexing and storage
        check: utils.general.wrap(
          makeCheck({eyes, client, target: driver, spec, signal: controller.signal, logger}),
          async (check, options = {}) => {
            const results = await check({...options, settings: {...options.settings, stepIndex: stepIndex++}})
            storage.push(...results.map(result => ({promise: result.promise, renderer: result.renderer})))
            return results
          },
        ),
        checkAndClose: makeCheckAndClose({eyes, client, target: driver, spec, signal: controller.signal, logger}),
        // close only once
        close: utils.general.wrap(makeClose({storage, logger}), async (close, options) => {
          if (closed || aborted) return []
          closed = true
          return close(options)
        }),
        // abort only once
        abort: utils.general.wrap(makeAbort({storage, controller, logger}), async (abort, options) => {
          if (aborted || closed) return []
          aborted = true
          return abort(options)
        }),
      }
    })
  }
}
