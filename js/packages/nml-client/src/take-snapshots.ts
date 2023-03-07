import type {SnapshotSettings, AndroidSnapshot, IOSSnapshot} from './types'
import {type Logger} from '@applitools/logger'
import {type NMLRequests} from './server/requests'

type Options = {
  requests: NMLRequests
  logger: Logger
}

export function makeTakeSnapshots({requests, logger: defaultLogger}: Options) {
  return async function takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>({
    settings,
    logger = defaultLogger,
  }: {
    settings: SnapshotSettings
    logger?: Logger
  }): Promise<TSnapshot[]> {
    return requests.takeSnapshots({settings, logger})
  }
}
