import type {OpenSettings, Eyes} from './types'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {extractBranchingTimestamp} from './utils/extract-branching-timestamp'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeClose} from './close'
import {makeAbort} from './abort'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  cwd: string
  logger: Logger
}

export function makeOpenEyes({requests, cwd = process.cwd(), logger: defaultLogger}: Options) {
  return async function openEyes({settings, logger = defaultLogger}: {settings: OpenSettings; logger?: Logger}): Promise<Eyes> {
    logger.log('Command "openEyes" is called with settings', settings)

    if (!settings.ignoreGitBranching) {
      if (!settings.gitBranchingTimestamp) {
        let branches = {branchName: settings.branchName, parentBranchName: settings.parentBranchName}
        try {
          if (settings.batch?.id && !branches.branchName && !branches.parentBranchName) {
            branches = await requests.getBatchBranches({settings: {...settings, batchId: settings.batch.id}})
          }
          if (branches.branchName && branches.parentBranchName && branches.branchName !== branches.parentBranchName) {
            settings.gitBranchingTimestamp = await extractBranchingTimestamp(branches, {cwd})
            logger.log('Branching timestamp successfully extracted', settings.gitBranchingTimestamp)
          }
        } catch (err) {
          logger.error('Error during extracting merge timestamp', err)
        }
      }
    } else {
      settings.gitBranchingTimestamp = undefined
    }

    const eyesRequests = await requests.openEyes({settings, logger})

    const aborted = utils.promises.makeControlledPromise<never>()
    const queue = []
    return utils.general.extend(eyesRequests, {
      check: utils.general.wrap(makeCheck({requests: eyesRequests, logger}), async (check, options) => {
        const index = options.settings?.stepIndex
        queue[index] ??= utils.promises.makeControlledPromise()
        if (index > 0) await Promise.race([(queue[index - 1] ??= utils.promises.makeControlledPromise()), aborted])
        return Promise.race([check(options), aborted]).finally(queue[index].resolve)
      }),
      checkAndClose: makeCheckAndClose({requests: eyesRequests, logger}),
      locateText: makeLocateText({requests: eyesRequests, logger}),
      extractText: makeExtractText({requests: eyesRequests, logger}),
      close: makeClose({requests: eyesRequests, logger}),
      abort: utils.general.wrap(makeAbort({requests: eyesRequests, logger}), async (abort, options) => {
        aborted.reject(new Error('Command "check" was aborted due to possible error in previous step'))
        return abort(options)
      }),
    })
  }
}
