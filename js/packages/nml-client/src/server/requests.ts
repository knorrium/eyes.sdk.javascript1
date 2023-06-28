import type {ScreenshotSettings, Screenshot, SnapshotSettings, IOSSnapshot, AndroidSnapshot} from '../types'
import {type Logger} from '@applitools/logger'
import {makeReqBroker, type ReqBrokerConfig} from './req-broker'
import * as utils from '@applitools/utils'

export interface NMLRequests {
  takeScreenshot(options: {settings: ScreenshotSettings; logger?: Logger}): Promise<Screenshot>
  takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>(options: {
    settings: SnapshotSettings
    logger?: Logger
  }): Promise<TSnapshot[]>
}

export type NMLRequestsConfig = ReqBrokerConfig & {brokerUrl: string}

export function makeNMLRequests({
  config,
  logger: defaultLogger,
}: {
  config: NMLRequestsConfig
  logger: Logger
}): NMLRequests {
  let brokerUrl = config.brokerUrl
  const req = makeReqBroker({config, logger: defaultLogger})

  return {takeScreenshot, takeSnapshots}

  async function takeScreenshot({
    settings,
    logger = defaultLogger,
  }: {
    settings: ScreenshotSettings
    logger?: Logger
  }): Promise<Screenshot> {
    const response = await req(brokerUrl, {
      name: 'TAKE_SCREENSHOT',
      body: {
        protocolVersion: '1.0',
        name: 'TAKE_SCREENSHOT',
        key: utils.general.guid(),
        payload: settings,
      },
      logger,
    })
    const result: any = await response.json()
    brokerUrl = result.nextPath
    return {
      image: result.payload.result.screenshotUrl,
    }
  }

  async function takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>({
    settings,
    logger = defaultLogger,
  }: {
    settings: SnapshotSettings
    logger?: Logger
  }): Promise<TSnapshot[]> {
    const response = await req(brokerUrl, {
      name: 'TAKE_SNAPSHOT',
      body: {
        protocolVersion: '1.0',
        name: 'TAKE_SNAPSHOT',
        key: utils.general.guid(),
        payload: {
          waitBeforeCapture: settings.waitBeforeCapture,
        },
      },
      logger,
    })
    const result: any = await response.json()
    brokerUrl = result.nextPath
    const platformName = result.payload.result.resourceMap.metadata.platformName
    const snapshot = {platformName, vhsHash: result.payload.result.resourceMap.vhs} as TSnapshot
    if (platformName === 'ios') {
      ;(snapshot as IOSSnapshot).vhsCompatibilityParams = {
        UIKitLinkTimeVersionNumber: result.payload.result.metadata.UIKitLinkTimeVersionNumber,
        UIKitRunTimeVersionNumber: result.payload.result.metadata.UIKitRunTimeVersionNumber,
      }
    } else if (platformName === 'android') {
      ;(snapshot as AndroidSnapshot).vhsType = 'android-x'
    }
    return Array(settings.renderers.length).fill(snapshot)
  }
}
