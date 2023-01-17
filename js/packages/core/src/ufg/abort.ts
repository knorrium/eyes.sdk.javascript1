import type {AbortSettings, TestResult} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type Renderer} from '@applitools/ufg-client'
import {type AbortController} from 'abort-controller'
import {AbortError} from '../errors/abort-error'
import type {DriverTarget} from './types'
import {isDriver, makeDriver, type SpecDriver} from '@applitools/driver'

type Options<TDriver, TContext, TElement, TSelector> = {
  storage: {renderer: Renderer; promise: Promise<{eyes: BaseEyes; renderer: Renderer}>}[]
  controller: AbortController
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeAbort<TDriver, TContext, TElement, TSelector>({
  storage,
  target,
  spec,
  controller,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function ({
    settings,
    logger = defaultLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    controller.abort()

    const tests = storage.reduce((tests, {renderer, promise}) => {
      const key = JSON.stringify(renderer)
      return tests.set(key, promise)
    }, new Map<string, Promise<{eyes: BaseEyes; renderer: Renderer}>>())

    return Promise.all(
      Array.from(tests.values(), async promise => {
        let eyes: BaseEyes, renderer: Renderer
        try {
          const value = await promise
          eyes = value.eyes
          renderer = value.renderer
        } catch (error) {
          eyes = error.info.eyes
          renderer = error.info.renderer
          if (!eyes) {
            if (error instanceof AbortError) return error.info
            else throw error
          }
        }
        const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
        const testMetadata = await driver?.getSessionMetadata()

        const [result] = await eyes.abort({settings: {...settings, testMetadata}, logger})
        return {...result, renderer} as TestResult
      }),
    )
  }
}
