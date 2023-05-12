import type {OpenSettings, Eyes} from './types'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {AbortController} from 'abort-controller'
import {extractBranchingTimestamp} from './utils/extract-branching-timestamp'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
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

export function makeOpenEyes({requests, concurrency, cwd = process.cwd(), logger: mainLogger}: Options) {
  const throttle = concurrency ? throat(concurrency) : (fn: () => any) => fn()

  return async function openEyes({
    settings,
    logger = mainLogger,
  }: {
    settings: OpenSettings
    logger?: Logger
  }): Promise<Eyes> {
    logger = logger.extend(mainLogger, {tags: [`eyes-base-${utils.general.shortid()}`]})

    logger.log('Command "openEyes" is called with settings', settings)
    if (!settings.ignoreGitBranching && !settings.gitBranchingTimestamp) {
      let branchName = settings.branchName
      let parentBranchName = settings.parentBranchName
      try {
        if (!branchName && !parentBranchName && settings.batch?.id && !settings.batch.id.startsWith('generated')) {
          const branches = await requests.getBatchBranches({settings: {...settings, batchId: settings.batch.id}})
          branchName = branches.branchName
          parentBranchName = branches.parentBranchName
        }
        if (branchName && parentBranchName && branchName !== parentBranchName) {
          settings.gitBranchingTimestamp = await extractBranchingTimestamp({branchName, parentBranchName}, {cwd})
          logger.log('Branching timestamp successfully extracted', settings.gitBranchingTimestamp)
        }
      } catch (err) {
        logger.error('Error during extracting merge timestamp', err)
      }
    } else {
      settings.gitBranchingTimestamp = undefined
    }

    return new Promise<Eyes>((resolve, reject) => {
      throttle(() => {
        return new Promise<void>(async done => {
          try {
            const controller = new AbortController()
            const eyesRequests = await requests.openEyes({settings, logger})
            resolve(
              utils.general.extend(eyesRequests, {
                check: makeCheck({requests: eyesRequests, signal: controller.signal, logger}),
                checkAndClose: makeCheckAndClose({requests: eyesRequests, done, signal: controller.signal, logger}),
                close: makeClose({requests: eyesRequests, done, logger}),
                abort: makeAbort({requests: eyesRequests, done, controller, logger}),
                getResults: makeGetResults({requests: eyesRequests, logger}),
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
