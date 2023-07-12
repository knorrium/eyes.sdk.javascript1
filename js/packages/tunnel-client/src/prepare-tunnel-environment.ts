import type {PrepareTunnelEnvironmentSettings} from './types'
import {type Logger} from '@applitools/logger'
//@ts-ignore
import {prepareEnvironment} from '@applitools/execution-grid-tunnel'

export function prepareTunnelEnvironment({
  settings,
  logger,
}: {
  settings?: PrepareTunnelEnvironmentSettings
  logger?: Logger
}) {
  return prepareEnvironment({
    egTunnelManagerUrl: settings?.tunnelServerUrl,
    customTestCacheDirectoryPath: settings?.cacheDir,
    logger,
  })
}
