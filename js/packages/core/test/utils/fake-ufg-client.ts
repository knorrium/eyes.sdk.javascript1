import {type UFGClient} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'
import EventEmitter from 'events'

const selectors = {
  sel1: {region: {x: 1, y: 2, width: 3, height: 4}},
  sel2: {region: {x: 5, y: 6, width: 7, height: 8}},
  sel3: {region: {x: 100, y: 101, width: 102, height: 103}},
  sel4: {region: {x: 200, y: 201, width: 202, height: 203}},
  sel5: {region: {x: 300, y: 301, width: 302, height: 303}},
  sel6: {region: {x: 400, y: 401, width: 402, height: 403}},
  sel7: {region: {x: 500, y: 501, width: 502, height: 503}},
  sel8: {region: {x: 600, y: 601, width: 602, height: 603}},
  sel9: {region: {x: 604, y: 604, width: 604, height: 604}},
  sel10: {region: {x: 605, y: 605, width: 605, height: 605}},
}

export function makeFakeClient({
  hooks,
}: {
  hooks?: {
    [TKey in keyof UFGClient]?: UFGClient[TKey] extends (...args: any[]) => any
      ? (...args: Parameters<UFGClient[TKey]>) => any
      : never
  }
} = {}): UFGClient & {emitter: EventEmitter} {
  const emitter = new EventEmitter()
  return {
    emitter,
    getChromeEmulationDevices: null as never,
    getIOSDevices: null as never,
    getAndroidDevices: null as never,
    async createRenderTarget(options) {
      emitter.emit('beforeCreateRenderTarget', options)
      try {
        await utils.general.sleep(10)
        await hooks?.createRenderTarget?.(options)
        const {snapshot} = options
        return snapshot as any
      } finally {
        emitter.emit('afterCreateRenderTarget', options)
      }
    },
    async getRenderEnvironment(options) {
      emitter.emit('beforeGetRenderEnvironment', options)
      try {
        await utils.general.sleep(0)
        await hooks?.getRenderEnvironment?.(options)
        const {settings} = options
        const renderer = settings.renderer as any
        const deviceName = renderer.chromeEmulationInfo ?? renderer.iosDeviceInfo ?? renderer.androidDeviceInfo
        const browserName = renderer.name
        return {
          renderEnvironmentId: 'renderer-uid',
          renderer: settings.renderer,
          rawEnvironment: {
            os: 'os',
            osInfo: 'os',
            hostingApp: browserName,
            hostingAppInfo: browserName,
            deviceInfo: deviceName ?? 'Desktop',
            inferred: `useragent:${browserName}`,
            displaySize: deviceName ? {width: 400, height: 655} : {width: renderer.width, height: renderer.height},
          },
        }
      } finally {
        emitter.emit('afterGetRenderEnvironment', options)
      }
    },
    async render(options) {
      emitter.emit('beforeRender', options)
      try {
        await utils.general.sleep(0)
        await hooks?.render?.(options)
        return {
          renderId: 'render-id',
          status: 'rendered',
          image: options.target as any as string,
          selectorRegions:
            options.settings.selectorsToCalculate?.map(() => [{x: 0, y: 0, width: 100, height: 100}]) ?? [],
          locationInViewport: options.settings.region
            ? utils.geometry.location(
                selectors[options.settings.region as keyof typeof selectors]?.region ?? options.settings.region,
              )
            : {x: 0, y: 0},
        }
      } finally {
        emitter.emit('afterRender', options)
      }
    },
    getCachedResourceUrls() {
      return [] as string[]
    },
  }
}
