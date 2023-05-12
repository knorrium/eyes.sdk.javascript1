import type {NMLClient} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeNMLRequests, type NMLRequestsConfig} from './server/requests'
import {makeTakeSnapshots} from './take-snapshots'
import {makeTakeScreenshot} from './take-screenshot'

export function makeNMLClient({
  config,
  logger: defaultLogger,
}: {
  config: NMLRequestsConfig
  logger?: Logger
}): NMLClient {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'nml-client'}})
  const requests = makeNMLRequests({config, logger})

  return {
    takeScreenshot: makeTakeScreenshot({requests, logger}),
    takeSnapshots: makeTakeSnapshots({requests, logger}),
  }
}
