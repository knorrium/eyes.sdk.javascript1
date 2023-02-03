import type {ScreenshotSettings, Screenshot, SnapshotSettings, AndroidSnapshot, IOSSnapshot} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeReqBroker, type ReqBrokerConfig} from './req-broker'
import * as utils from '@applitools/utils'

export async function takeScreenshot({
  url,
  settings,
  logger,
}: {
  url: string
  settings: ReqBrokerConfig & ScreenshotSettings
  logger?: Logger
}): Promise<Screenshot> {
  logger = logger?.extend({label: 'nml client'}) ?? makeLogger({label: 'nml client'})
  const req = makeReqBroker({config: settings, logger})
  const payload = {
    name: settings.name,
    screenshotMode: settings.fully ? 'FULL_RESIZE' : 'VIEWPORT',
    scrollRootElement: settings.scrollRootElement,
    hideCaret: settings.hideCaret,
    waitBeforeCapture: settings.waitBeforeCapture,
    overlap: settings.overlap,
    selectorsToFindRegionsFor: [] as any[],
  }
  const response = await req(url, {
    name: 'TAKE_SCREENSHOT',
    body: {
      protocolVersion: '1.0',
      name: 'TAKE_SCREENSHOT',
      key: utils.general.guid(),
      payload,
    },
    logger,
  })
  const result = await response.json()
  return result.payload
}

export async function takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>({
  url,
  settings,
  logger,
}: {
  url: string
  settings: ReqBrokerConfig & SnapshotSettings
  logger?: Logger
}): Promise<TSnapshot[]> {
  logger = logger?.extend({label: 'nml client'}) ?? makeLogger({label: 'nml client'})
  const req = makeReqBroker({config: settings, logger})
  const payload = {
    waitBeforeCapture: settings.waitBeforeCapture,
  }
  const response = await req(url, {
    name: 'TAKE_SNAPSHOT',
    body: {
      protocolVersion: '1.0',
      name: 'TAKE_SNAPSHOT',
      key: utils.general.guid(),
      payload,
    },
  })
  const snapshot = await response.json().then(({payload}) => {
    const platformName = payload.result.resourceMap.metadata.platformName
    const snapshot = {platformName, vhsHash: payload.result.resourceMap.vhs} as TSnapshot
    if (platformName === 'ios') {
      ;(snapshot as IOSSnapshot).vhsCompatibilityParams = {
        UIKitLinkTimeVersionNumber: payload.result.metadata.UIKitLinkTimeVersionNumber,
        UIKitRunTimeVersionNumber: payload.result.metadata.UIKitRunTimeVersionNumber,
      }
    } else if (platformName === 'android') {
      ;(snapshot as AndroidSnapshot).vhsType = 'android-x'
    }

    return snapshot
  })

  return Array(settings.renderers.length).fill(snapshot)
}
