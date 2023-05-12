import {type ContentfulResource} from './resource'
import {type UFGRequests} from '../server/requests'
import {mergeLoggers, type Logger} from '@applitools/logger'
import throat from 'throat'
import * as utils from '@applitools/utils'

type Options = {
  requests: UFGRequests
  concurrency?: number
  timeout?: number
  batchingTimeout?: number
  logger: Logger
}

export type UploadResource = (options: {resource: ContentfulResource; logger?: Logger}) => Promise<void>

export function makeUploadResource({
  requests,
  batchingTimeout = 300,
  concurrency = 100,
  logger: mainLogger,
}: Options): UploadResource {
  const uploadedResources = new Set<string>()
  const requestedResources = new Map<string, Promise<void>>()
  const uploadResourceWithConcurrency = throat(concurrency, requests.uploadResource)
  const uploadResourceWithBatching = utils.general.batchify(uploadResources, {timeout: batchingTimeout})

  return async function uploadResource({
    resource,
    logger = mainLogger,
  }: {
    resource: ContentfulResource
    logger?: Logger
  }): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`upload-resource-${utils.general.shortid()}`]})

    const hash = resource.hash.hash
    if (uploadedResources.has(hash)) {
      return Promise.resolve()
    } else if (requestedResources.has(hash)) {
      return requestedResources.get(hash)
    } else {
      const promise = uploadResourceWithBatching({resource, logger})
        .then(result => {
          uploadedResources.add(hash)
          return result
        })
        .finally(() => {
          requestedResources.delete(hash)
        })
      requestedResources.set(hash, promise)
      return promise
    }
  }

  async function uploadResources(
    batch: [{resource: ContentfulResource; logger: Logger}, {resolve(): void; reject(reason?: any): void}][],
  ) {
    const logger = mergeLoggers(...batch.map(([{logger}]) => logger))

    try {
      const presentedResources = await requests.checkResources({
        resources: batch.map(([{resource}]) => resource),
        logger,
      })

      presentedResources.forEach((presented, index) => {
        const [options, {resolve, reject}] = batch[index]
        if (presented) {
          resolve()
        } else {
          uploadResourceWithConcurrency(options).then(resolve, reject)
        }
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
