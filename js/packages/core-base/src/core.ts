import type {Core} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCoreRequests} from './server/requests'
import {makeOpenEyes} from './open-eyes'
import {makeOpenFunctionalSession} from './open-functional-session'
import {makeLocate} from './locate'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeCloseBatch} from './close-batch'
import {makeDeleteTest} from './delete-test'

export type Options = {
  agentId?: string
  concurrency?: number
  cwd?: string
  logger?: Logger
}

export function makeCore({
  agentId = 'core-base',
  concurrency,
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options): Core {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'core-base'}})
  logger.log(`Core is initialized in directory ${cwd} for agent ${agentId}`)
  const coreRequests = makeCoreRequests({agentId, logger})

  return {
    openEyes: makeOpenEyes({requests: coreRequests, concurrency, cwd, logger}),
    openFunctionalSession: makeOpenFunctionalSession({requests: coreRequests, concurrency, cwd, logger}),
    locate: makeLocate({requests: coreRequests, logger}),
    locateText: makeLocateText({requests: coreRequests, logger}),
    extractText: makeExtractText({requests: coreRequests, logger}),
    closeBatch: makeCloseBatch({requests: coreRequests, logger}),
    deleteTest: makeDeleteTest({requests: coreRequests, logger}),
    getAccountInfo: coreRequests.getAccountInfo,
    logEvent: coreRequests.logEvent,
  }
}
