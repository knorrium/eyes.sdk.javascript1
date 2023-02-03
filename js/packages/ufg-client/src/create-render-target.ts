import type {DomSnapshot, RenderTarget, Snapshot} from './types'
import {type ProcessResources, type ProcessResourcesSettings, type ResourceMapping} from './resources/process-resources'
import {makeResource, type HashedResource} from './resources/resource'
import {makeResourceDom} from './resources/resource-dom'
import {makeResourceVhs} from './resources/resource-vhs'
import * as utils from '@applitools/utils'

export function makeCreateRenderTarget({processResources}: {processResources: ProcessResources}) {
  return async function createRenderTarget({
    snapshot,
    settings,
  }: {
    snapshot: any
    settings?: ProcessResourcesSettings
  }): Promise<RenderTarget> {
    const isWeb = !!snapshot.cdt
    const processedSnapshotResources = await processSnapshotResources({snapshot, settings})

    const resources = await processedSnapshotResources.promise

    const hashedSnapshot = resources[isWeb ? snapshot.url : 'vhs'] as HashedResource
    if (isWeb) {
      delete resources[snapshot.url]
    }

    return {
      snapshot: hashedSnapshot,
      resources,
      source: snapshot.url,
      vhsType: snapshot.vhsType,
      vhsCompatibilityParams: snapshot.vhsCompatibilityParams,
    }
  }

  async function processSnapshotResources({
    snapshot,
    settings,
  }: {
    snapshot: Snapshot
    settings?: ProcessResourcesSettings
  }): Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}> {
    const [snapshotResources, ...frameResources] = await Promise.all([
      processResources({
        resources: {
          ...(utils.types.has(snapshot, 'resourceUrls') ? snapshot.resourceUrls : []).reduce((resources, url) => {
            return Object.assign(resources, {[url]: makeResource({url, renderer: settings?.renderer})})
          }, {}),
          ...Object.entries(utils.types.has(snapshot, 'resourceContents') ? snapshot.resourceContents : {}).reduce(
            (resources, [url, resource]) => {
              return Object.assign(resources, {
                [url]: utils.types.has(resource, 'errorStatusCode')
                  ? makeResource({id: url, errorStatusCode: resource.errorStatusCode})
                  : makeResource({
                      url,
                      value: resource.value,
                      contentType: resource.type,
                      dependencies: resource.dependencies,
                    }),
              })
            },
            {},
          ),
        },
        settings: {referer: utils.types.has(snapshot, 'url') ? snapshot.url : undefined, ...settings},
      }),
      ...(utils.types.has(snapshot, 'frames') ? snapshot.frames ?? [] : []).map(frameSnapshot => {
        return processSnapshotResources({snapshot: frameSnapshot, settings})
      }),
    ])

    const frameDomResourceMapping = frameResources.reduce((mapping, resources, index) => {
      const frameUrl = (snapshot as DomSnapshot).frames[index].url
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

    const processedDomResource = await processResources({resources: domResource})

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
