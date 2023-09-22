import type {Size, Location, Region} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {type Proxy} from '@applitools/req'

export interface NMLClient {
  takeScreenshots(options: {settings: ScreenshotSettings; logger?: Logger}): Promise<Screenshot[]>
  takeSnapshots<TSnapshot extends IOSSnapshot | AndroidSnapshot = IOSSnapshot | AndroidSnapshot>(options: {
    settings: SnapshotSettings
    logger?: Logger
  }): Promise<TSnapshot[]>
  getSupportedRenderEnvironments(options: {logger?: Logger}): Promise<Record<string, any>>
}

export interface BrokerServerSettings {
  brokerUrl: string
  renderEnvironmentsUrl: string
  agentId?: string
  proxy?: Proxy
  useDnsCache?: boolean
}

export type NMLClientSettings = BrokerServerSettings

export interface IOSDeviceRenderer {
  iosDeviceInfo: {
    deviceName: string
    version?: string
    screenOrientation?: string
  }
}
export interface AndroidDeviceRenderer {
  androidDeviceInfo: {
    deviceName: string
    version?: string
    screenOrientation?: string
  }
}
export interface EnvironmentRenderer {
  environment: any
}
export type Renderer = IOSDeviceRenderer | AndroidDeviceRenderer | EnvironmentRenderer

export interface RenderEnvironment {
  os: string
  deviceName: string
  viewportSize: Size
  renderEnvironmentId: string
  renderer: Renderer
}

export type Selector = string | {selector: string; type?: string; shadow?: Selector; frame?: Selector}

export type ScreenshotSettings = {
  renderers: Renderer[]
  webview?: boolean | string
  region?: Region | Selector
  fully?: boolean
  scrollRootElement?: Selector
  stitchMode?: 'Scroll' | 'CSS' | 'Resize'
  hideScrollbars?: boolean
  hideCaret?: boolean
  overlap?: {top?: number; bottom?: number}
  waitBeforeCapture?: number
  waitBetweenStitches?: number
  lazyLoad?:
    | boolean
    | {
        scrollLength?: number
        waitingTime?: number
        maxAmountToScroll?: number
      }
  selectorsToFindRegionsFor?: Selector[]
  name?: string
}

export type Screenshot = {
  image: string
  size?: Size
  name?: string
  source?: string
  dom?: string
  locationInViewport?: Location
  locationInView?: Location
  fullViewSize?: Size
  calculatedRegions?: Region[]
  renderEnvironment: RenderEnvironment
}

export type SnapshotSettings = {
  renderers: Renderer[]
  resourceSeparation?: boolean
  waitBeforeCapture?: number
  name?: string
}

export type AndroidSnapshot = {
  platformName: 'android'
  vhsType: string
  vhsHash: {hashFormat: string; hash: string; contentType: string}
}

export type IOSSnapshot = {
  platformName: 'ios'
  vhsCompatibilityParams: Record<string, any>
  vhsHash: {hashFormat: string; hash: string; contentType: string}
}
