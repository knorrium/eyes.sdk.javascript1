import type {NMLClient, NMLClientSettings} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeNMLRequests} from './server/requests'
import {makeTakeSnapshots} from './take-snapshots'
import {makeTakeScreenshots} from './take-screenshots'

export function makeNMLClient({
  settings,
  logger: defaultLogger,
}: {
  settings: NMLClientSettings
  logger?: Logger
}): NMLClient {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'nml-client'}})
  const requests = makeNMLRequests({settings, logger})

  return {
    takeScreenshots: makeTakeScreenshots({requests, logger}),
    takeSnapshots: makeTakeSnapshots({requests, logger}),
    getSupportedRenderEnvironments: requests.getSupportedRenderEnvironments,
  }
}
