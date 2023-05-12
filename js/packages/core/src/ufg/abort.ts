import type {DriverTarget, AbortSettings} from './types'
import {type Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type AbortController} from 'abort-controller'
import {isDriver, makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {Renderer} from '@applitools/ufg-client'

type Options<TSpec extends SpecType> = {
  storage: Map<string, Promise<{renderer: Renderer; eyes: BaseEyes}>[]>
  controller: AbortController
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeAbort<TSpec extends SpecType>({
  storage,
  target,
  spec,
  controller,
  logger: mainLogger,
}: Options<TSpec>) {
  return async function abort({
    settings,
    logger = mainLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger)

    logger.log('Command "abort" is called with settings', settings)
    controller.abort()
    settings ??= {}
    if (!settings.testMetadata) {
      try {
        const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
        settings.testMetadata = await driver?.getSessionMetadata()
      } catch (error: any) {
        logger.warn('Command "abort" received an error during extracting driver metadata', error)
      }
    }

    storage.forEach(async promises => {
      try {
        const {eyes} = await Promise.race(promises)
        await eyes.abort({settings, logger})
      } catch (error: any) {
        logger.warn('Command "abort" received an error during waiting for eyes instances in background', error)
        await error?.info?.eyes?.abort({settings, logger})
      }
    })
  }
}
