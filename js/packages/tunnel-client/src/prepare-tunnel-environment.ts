import type {PrepareTunnelEnvironmentSettings} from './types'
import {type Logger} from '@applitools/logger'
//@ts-ignore
import {prepareEnvironment} from '@applitools/execution-grid-tunnel'

export async function prepareTunnelEnvironment({
  settings,
  logger,
}: {
  settings?: PrepareTunnelEnvironmentSettings
  logger?: Logger
}) {
  try {
    await prepareEnvironment({
      egTunnelManagerUrl: settings?.tunnelServerUrl,
      customTestCacheDirectoryPath: settings?.cacheDir,
      logger,
    })
  } catch (error: any) {
    if (error.message !== 'PREPARE_ENV_ALREADY_RUNNING') throw error
  }
}
