import {type Hooks} from '@applitools/req'
import {AbortController} from 'abort-controller'
import {type Logger} from '@applitools/logger'

export function handleLogs({logger}: {logger?: Logger}): Hooks {
  return {
    async beforeRequest({request}) {
      logger?.log(
        `Resource with url ${request.url} will be fetched using headers`,
        Object.fromEntries(request.headers.entries()),
        `and body ${JSON.stringify(await request.clone().text())}`,
      )
    },
    beforeRetry({request, attempt}) {
      logger?.log(`Resource with url ${request.url} will be re-fetched (attempt ${attempt})`)
    },
    afterResponse({request, response}) {
      logger?.log(`Resource with url ${request.url} respond with ${response.statusText}(${response.statusText})`)
    },
    afterError({request, error}) {
      logger?.error(`Resource with url ${request.url} failed with error`, error)
    },
  }
}

export function handleStreaming({timeout, logger}: {timeout: number; logger?: Logger}): Hooks {
  const controller = new AbortController()
  return {
    async beforeRequest({request}) {
      if (request.signal?.aborted) return
      request.signal?.addEventListener('abort', () => controller.abort())
      return {request, signal: controller.signal}
    },
    async afterResponse({response}) {
      const contentLength = response.headers.get('Content-Length')
      const contentType = response.headers.get('Content-Type')
      const isProbablyStreaming = response.ok && !contentLength && contentType && /^(audio|video)\//.test(contentType)
      if (!isProbablyStreaming) return
      return new Promise(resolve => {
        const timer = setTimeout(() => {
          controller.abort()
          resolve({status: 599})
          logger?.log(`Resource with url ${response.url} was interrupted, due to it takes too long to download`)
        }, timeout)
        response
          .arrayBuffer()
          .then(body => resolve({response, body: Buffer.from(body)}))
          .catch(() => resolve({status: 599}))
          .finally(() => clearTimeout(timer))
      })
    },
  }
}
