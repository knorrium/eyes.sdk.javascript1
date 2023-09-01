import type {
  BrokerServerSettings,
  ScreenshotSettings,
  Screenshot,
  SnapshotSettings,
  IOSSnapshot,
  AndroidSnapshot,
  RenderEnvironment,
} from '../types'
import {type Logger} from '@applitools/logger'
import {makeReqBroker} from './req-broker'
import globalReq from '@applitools/req'
import * as utils from '@applitools/utils'

export interface NMLRequests {
  getSupportedRenderEnvironments(options: {logger?: Logger}): Promise<Record<string, any>>
  takeScreenshots(options: {settings: ScreenshotSettings; logger?: Logger}): Promise<Screenshot[]>
  takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>(options: {
    settings: SnapshotSettings
    logger?: Logger
  }): Promise<TSnapshot[]>
}

export function makeNMLRequests({
  settings,
  logger: mainLogger,
}: {
  settings: BrokerServerSettings
  logger: Logger
}): NMLRequests {
  let brokerUrl = settings.brokerUrl
  const req = makeReqBroker({settings, logger: mainLogger})

  const getSupportedRenderEnvironmentsWithCache = utils.general.cachify(getSupportedRenderEnvironments, () => 'default')

  return {
    getSupportedRenderEnvironments: getSupportedRenderEnvironmentsWithCache,
    takeScreenshots,
    takeSnapshots,
  }

  async function getSupportedRenderEnvironments({logger: _logger}: {logger?: Logger}): Promise<Record<string, any>> {
    const response = await globalReq(settings.renderEnvironmentsUrl)
    const result: any = await response.json()
    return result
  }

  async function takeScreenshots({
    settings,
    logger = mainLogger,
  }: {
    settings: ScreenshotSettings
    logger?: Logger
  }): Promise<Screenshot[]> {
    logger = logger.extend(mainLogger, {tags: [`nml-request-${utils.general.shortid()}`]})

    logger.log('Request "takeScreenshots" called with settings', settings)

    const supportedRenderEnvironments = await getSupportedRenderEnvironmentsWithCache({logger})
    const {localEnvironment, renderEnvironments, rendererSettings} = settings.renderers.reduce(
      (result, renderer) => {
        if (utils.types.has(renderer, 'environment')) {
          result.localEnvironment = {...renderer.environment, renderEnvironmentId: utils.general.guid(), renderer}
        } else {
          const deviceInfo = utils.types.has(renderer, 'iosDeviceInfo')
            ? renderer.iosDeviceInfo
            : renderer.androidDeviceInfo
          const orientation =
            deviceInfo.screenOrientation === 'landscape' ? 'landscapeLeft' : deviceInfo.screenOrientation ?? 'portrait'
          const rawEnvironment = supportedRenderEnvironments[deviceInfo.deviceName][orientation].env
          result.renderEnvironments.push({
            renderEnvironmentId: utils.general.guid(),
            renderer,
            deviceName: rawEnvironment.deviceInfo,
            os: rawEnvironment.os + (deviceInfo.version ? ` ${deviceInfo.version}` : ''),
            viewportSize: rawEnvironment.displaySize,
          })
          result.rendererSettings.push({...supportedRenderEnvironments[deviceInfo.deviceName], orientation})
        }
        return result
      },
      {
        localEnvironment: undefined as RenderEnvironment | undefined,
        renderEnvironments: [] as RenderEnvironment[],
        rendererSettings: [] as any[],
      },
    )

    try {
      const response = await req(brokerUrl, {
        name: 'TAKE_SCREENSHOT',
        body: {
          protocolVersion: '1.0',
          name: 'TAKE_SCREENSHOT',
          key: utils.general.guid(),
          payload: {
            ...settings,
            renderers: undefined,
            deviceList: !localEnvironment ? rendererSettings : undefined,
          },
        },
        logger,
      })
      const result: any = await response.json()
      brokerUrl = result.nextPath
      const screenshots = localEnvironment
        ? [{image: result.payload.result.screenshotUrl, renderEnvironment: localEnvironment}]
        : renderEnvironments.map((renderEnvironment, index) => {
            return {image: result.payload[index].result.screenshotUrl, renderEnvironment}
          })

      logger.log('Request "takeScreenshots" finished successfully with body', screenshots)

      return screenshots
    } catch (error: any) {
      if (error.nextPath) brokerUrl = error.nextPath
      throw error
    }
  }

  async function takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>({
    settings,
    logger = mainLogger,
  }: {
    settings: SnapshotSettings
    logger?: Logger
  }): Promise<TSnapshot[]> {
    try {
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
    } catch (error: any) {
      if (error.nextPath) brokerUrl = error.nextPath
      throw error
    }
  }
}
