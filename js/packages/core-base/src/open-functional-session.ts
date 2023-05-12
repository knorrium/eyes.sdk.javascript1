import type {OpenSettings, FunctionalSession} from './types'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {AbortController} from 'abort-controller'
import {makeClose} from './close'
import {makeAbort} from './abort'
import {makeGetResults} from './get-results'
import throat from 'throat'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  concurrency?: number
  cwd?: string
  logger: Logger
}

export function makeOpenFunctionalSession({requests, concurrency, logger: mainLogger}: Options) {
  const throttle = concurrency ? throat(concurrency) : (fn: () => any) => fn()

  return async function openFunctionalSession({
    settings,
    logger = mainLogger,
  }: {
    settings: OpenSettings
    logger?: Logger
  }): Promise<FunctionalSession> {
    logger = logger.extend(mainLogger, {tags: [`functional-session-base-${utils.general.shortid()}`]})

    logger.log('Command "openFunctionalSession" is called with settings', settings)

    return new Promise<FunctionalSession>((resolve, reject) => {
      throttle(() => {
        return new Promise<void>(async done => {
          try {
            const controller = new AbortController()
            const functionalSessionRequests = await requests.openFunctionalSession({settings, logger})
            resolve(
              utils.general.extend(functionalSessionRequests, {
                close: makeClose({requests: functionalSessionRequests, done, logger}),
                abort: makeAbort({requests: functionalSessionRequests, done, controller, logger}),
                getResults: makeGetResults({requests: functionalSessionRequests, logger}),
              }),
            )
          } catch (error) {
            reject(error)
            done()
          }
        })
      })
    })
  }
}
