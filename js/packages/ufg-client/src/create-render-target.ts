import type {Snapshot, DomSnapshot, RenderTargetSettings, RenderTarget} from './types'
import {type Logger} from '@applitools/logger'
import {type ProcessResources, type ProcessResourcesSettings, type ResourceMapping} from './resources/process-resources'
import {makeResource, type HashedResource} from './resources/resource'
import {makeResourceDom} from './resources/resource-dom'
import {makeResourceVhs} from './resources/resource-vhs'
import * as utils from '@applitools/utils'

type Options = {
  processResources: ProcessResources
  logger: Logger
}

export function makeCreateRenderTarget({processResources, logger: mainLogger}: Options) {
  return async function createRenderTarget({
    snapshot,
    settings,
    logger = mainLogger,
  }: {
    snapshot: Snapshot
    settings?: RenderTargetSettings
    logger?: Logger
  }): Promise<RenderTarget> {
    logger = logger.extend(mainLogger, {tags: [`render-target-${utils.general.shortid()}`]})

    const processedSnapshotResources = await processSnapshotResources({snapshot, settings, logger})
    const resources = await processedSnapshotResources.promise

    if (utils.types.has(snapshot, 'cdt')) {
      const snapshotResource = resources[snapshot.url] as HashedResource
      delete resources[snapshot.url]
      return {snapshot: snapshotResource, resources, source: snapshot.url}
    } else {
      const snapshotResource = resources.vhs as HashedResource
      return utils.types.has(snapshot, 'vhsType')
        ? {snapshot: snapshotResource, resources, vhsType: snapshot.vhsType}
        : {snapshot: snapshotResource, resources, vhsCompatibilityParams: snapshot.vhsCompatibilityParams}
    }
  }

  async function processSnapshotResources({
    snapshot,
    settings,
    logger,
  }: {
    snapshot: Snapshot
    settings?: ProcessResourcesSettings
    logger?: Logger
  }): Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}> {
    const [snapshotResources, ...frameResources] = await Promise.all([
      processResources({
        resources: Object.fromEntries([
          ...((snapshot as DomSnapshot).resourceUrls ?? []).map(url => {
            return [url, makeResource({url, renderer: settings?.renderer})]
          }),
          ...Object.entries((snapshot as DomSnapshot).resourceContents ?? {}).map(([url, resource]) => {
            return [
              url,
              utils.types.has(resource, 'errorStatusCode')
                ? makeResource({id: url, errorStatusCode: resource.errorStatusCode})
                : makeResource({
                    url,
                    value: resource.value,
                    contentType: resource.type,
                    dependencies: resource.dependencies,
                  }),
            ]
          }),
        ]),
        settings: {
          ...settings,
          headers: {...settings?.headers, Referer: utils.types.has(snapshot, 'url') ? snapshot.url : undefined},
        },
        logger,
      }),
      ...((snapshot as DomSnapshot).frames ?? []).map(frameSnapshot => {
        return processSnapshotResources({snapshot: frameSnapshot, settings, logger})
      }),
    ])

    const frameDomResourceMapping = frameResources.reduce((mapping, resources, index) => {
      const frameUrl = (snapshot as DomSnapshot).frames![index].url
      return Object.assign(mapping, {[frameUrl]: resources.mapping[frameUrl]})
    }, {})

    const resourceMappingWithoutDom = {...snapshotResources.mapping, ...frameDomResourceMapping}
    const domResource = utils.types.has(snapshot, 'cdt')
      ? {
          [snapshot.url]: makeResourceDom({
            cdt: snapshot.cdt,
            resources: resourceMappingWithoutDom,
          }),
        }
      : {
          vhs: makeResourceVhs({
            vhsHash: utils.types.has(snapshot, 'vhsHash')
              ? snapshot.vhsHash /* android */
              : snapshotResources.mapping.vhs /* ios */,
            vhsType: utils.types.has(snapshot, 'vhsType') ? snapshot.vhsHash : undefined, // will only be populated in android
            platformName: snapshot.platformName,
            resources: resourceMappingWithoutDom, // this will be empty until resources are supported inside VHS
          }),
        }

    const processedDomResource = await processResources({resources: domResource, logger})

    const frameResourceMapping = frameResources.reduce((mapping, resources) => {
      return Object.assign(mapping, resources.mapping)
    }, {})

    const resourceMapping = {
      ...frameResourceMapping,
      ...snapshotResources.mapping,
      ...processedDomResource.mapping,
    }

    return {
      mapping: resourceMapping,
      promise: Promise.all([
        snapshotResources.promise,
        processedDomResource.promise,
        ...frameResources.map(resources => resources.promise),
      ]).then(() => resourceMapping),
    }
  }
}
