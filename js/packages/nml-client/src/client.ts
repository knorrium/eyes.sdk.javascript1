import type {NMLClient} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeNMLRequests, type NMLRequestsConfig} from './server/requests'
import {makeTakeSnapshots} from './take-snapshots'
import {makeTakeScreenshot} from './take-screenshot'

export function makeNMLClient({config, logger}: {config: NMLRequestsConfig; logger?: Logger}): NMLClient {
  logger = logger?.extend({label: 'nml client'}) ?? makeLogger({label: 'nml client'})
  const requests = makeNMLRequests({config, logger})

  return {
    takeScreenshot: makeTakeScreenshot({requests, logger}),
    takeSnapshots: makeTakeSnapshots({requests, logger}),
  }
}
