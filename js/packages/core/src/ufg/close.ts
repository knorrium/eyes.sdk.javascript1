import type {CloseSettings, TestResult} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type Renderer} from '@applitools/ufg-client'
import type {DriverTarget} from './types'
import {isDriver, makeDriver, type SpecDriver} from '@applitools/driver'

type Options<TDriver, TContext, TElement, TSelector> = {
  storage: {renderer: Renderer; promise: Promise<{eyes: BaseEyes; renderer: Renderer}>}[]
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeClose<TDriver, TContext, TElement, TSelector>({
  storage,
  target,
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function ({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    const tests = storage.reduce((tests, {renderer, promise}) => {
      const key = JSON.stringify(renderer)
      const promises = tests.get(key) ?? []
      promises.push(promise)
      return tests.set(key, promises)
    }, new Map<string, Promise<{eyes: BaseEyes; renderer: Renderer}>[]>())
    return Promise.all(
      Array.from(tests.values(), async promises => {
        try {
          const [{eyes, renderer}] = await Promise.all(promises)

          const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
          const testMetadata = await driver?.getSessionMetadata()

          const [result] = await eyes.close({settings: {...settings, testMetadata}, logger})
          return {...result, renderer}
        } catch (error) {
          await error.info?.eyes?.abort({logger})
          throw error
        }
      }),
    )
  }
}
