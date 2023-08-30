import type {Mutable} from '@applitools/utils'
import type {DriverTarget, Eyes, AbortSettings, Renderer} from './types'
import {type Logger} from '@applitools/logger'
import {type AbortController} from 'abort-controller'
import {isDriver, makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {uniquifyRenderers} from './utils/uniquify-renderers'

type Options<TSpec extends SpecType> = {
  eyes: Eyes<TSpec>
  target?: DriverTarget<TSpec>
  controller: AbortController
  renderers?: Renderer[]
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeAbort<TSpec extends SpecType>({
  eyes,
  target,
  controller,
  renderers: defaultRenderers,
  spec,
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

    if (!eyes.running) {
      logger.log('Command "abort" will be ignored because eyes were already stopped')
      return
    } else {
      ;(eyes as Mutable<typeof eyes>).running = false
    }

    controller.abort()
    settings ??= {}
    if (!settings.testMetadata && isDriver(target, spec)) {
      try {
        const driver = await makeDriver({spec, driver: target, relaxed: true, logger})
        settings.testMetadata = await driver.getSessionMetadata()
      } catch (error: any) {
        logger.warn('Command "abort" received an error during extracting driver metadata', error)
      }
    }

    settings.renderers ??= defaultRenderers
    if (eyes.storage.size === 0 && settings.renderers && settings.renderers.length > 0) {
      const uniqueRenderers = uniquifyRenderers(settings.renderers)
      logger.log('Command "abort" starting filler tests for renderers', uniqueRenderers)
      await Promise.all(uniqueRenderers.map(renderer => eyes.getBaseEyes({settings: {renderer}, logger})))
    }

    eyes.storage.forEach(async item => {
      try {
        const eyes = await item.eyes
        await eyes.abort({settings, logger})
      } catch (error: any) {
        logger.warn('Command "abort" received an error during waiting for eyes instances in background', error)
        await error?.info?.eyes?.abort({settings, logger})
      }
    })
  }
}
