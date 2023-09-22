import type {TunnelClientWorkerSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeReq, type Hooks} from '@applitools/req'
import * as utils from '@applitools/utils'

export async function* makeGenerator({
  settings,
  logger,
}: {
  settings: TunnelClientWorkerSettings
  logger: Logger
}): AsyncGenerator<Record<string, any>[], Record<string, any>[], Record<string, any>[]> {
  settings.pollingTimeout ??= 10_000

  const req = makeReq({
    baseUrl: settings.pollingServerUrl,
    retry: {
      timeout: 10_000,
      validate: ({response, error}) =>
        response?.status !== 200 &&
        !utils.types.instanceOf(error, 'AbortError') &&
        !utils.types.instanceOf(error, 'ConnectionTimeoutError'),
    },
    hooks: [handleLogs({logger})],
    connectionTimeout: settings.timeout ?? 5 * 60_000,
  })

  const response = await req(`/tunnel-agents/${settings.agentId}/init`, {
    method: 'POST',
    headers: {'x-secret': settings.secret},
    body: {instance_info: settings.envInfo},
  })

  const instanceId = await response.json().then((result: any) => result.instance_id)

  let pendingRequestMessages = [] as Record<string, any>[]
  let outgoingResponseMessages = [] as Record<string, any>[]
  let tunnelsEventMessage: Record<string, any> | undefined
  let metricsEventMessage: Record<string, any> | undefined
  while (true) {
    const response = await req(`/tunnel-agents/${settings.agentId}/agentpoll`, {
      method: 'POST',
      headers: {'x-secret': settings.secret},
      body: {
        instance_id: instanceId,
        metrics: metricsEventMessage?.payload,
        open_tunnels: tunnelsEventMessage?.payload.map((tunnel: any) => ({id: tunnel.tunnelId})),
        pending_tasks: pendingRequestMessages.map(message => ({id: message.key})),
        completed_tasks: outgoingResponseMessages.map(message => {
          if (message.payload.error) {
            return {
              id: message.key,
              status: 'FAILED',
              error: message.payload.error.message,
              error_code: message.payload.reason,
            }
          } else {
            let response
            if (message.name === 'TunnelClient.create' || message.name === 'TunnelClient.replace') {
              response = {tunnelId: message.payload.result.tunnelId}
            } else if (message.name === 'TunnelClient.fetch') {
              response = {resource_content: message.payload.result}
            }
            return {id: message.key, status: 'SUCCESS', response}
          }
        }),
        agent_status: 'OK',
      },
    })
    let incomingRequestMessages = [] as any
    let pollingTimeout = settings.pollingTimeout
    try {
      const result: any = await response.json()
      if (result.abort) {
        return [{name: 'TunnelClient.close', payload: {reason: result.abort_reason}}]
      }
      if (result.polling_interval_sec) pollingTimeout = result.polling_interval_sec * 1000
      incomingRequestMessages = result.tasks.flatMap((task: any) => {
        if (task.type === 'CREATE_TUNNEL') {
          return {
            name: 'TunnelClient.create',
            key: task.id,
            payload: {apiKey: task.apiKey, eyesServerUrl: task.eyesServerUrl},
          }
        } else if (task.type === 'DELETE_TUNNEL') {
          return {
            name: 'TunnelClient.destroy',
            key: task.id,
            payload: task.tunnel_id,
          }
        } else if (task.type === 'REPLACE_TUNNEL') {
          return {
            name: 'TunnelClient.replace',
            key: task.id,
            payload: task.tunnel_id,
          }
        } else if (task.type === 'GET_RESOURCE') {
          return {
            name: 'TunnelClient.fetch',
            key: task.id,
            payload: {resourceUrl: task.resource_url},
          }
        } else {
          return []
        }
      })
    } catch (error) {
      logger.error(error)
      incomingRequestMessages = []
    }
    pendingRequestMessages = pendingRequestMessages.concat(incomingRequestMessages)
    outgoingResponseMessages = []
    const outgoingMessages = yield incomingRequestMessages
    outgoingMessages.forEach(message => {
      if (message.name === 'TunnelClient.list') tunnelsEventMessage = message
      else if (message.name === 'TunnelClient.metrics') metricsEventMessage = message
      else outgoingResponseMessages.push(message)
    })
    pendingRequestMessages = pendingRequestMessages.filter(
      pendingMessage => !outgoingResponseMessages.some(outgoingMessage => outgoingMessage.key === pendingMessage.key),
    )

    await utils.general.sleep(pollingTimeout)
  }
}

function handleLogs({logger}: {logger?: Logger} = {}): Hooks {
  const guid = utils.general.guid()
  let counter = 0

  return {
    beforeRequest({request, options}) {
      let requestId = request.headers.get('x-applitools-eyes-client-request-id')
      if (!requestId) {
        requestId = `${counter++}--${guid}`
        request.headers.set('x-applitools-eyes-client-request-id', requestId)
      }
      logger?.log(
        `Request [${requestId}] will be sent to the address "[${request.method}]${request.url}" with body`,
        options?.body,
      )
    },
    beforeRetry({request, attempt, error, response, options}) {
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')!
      logger?.log(
        `Request [${requestId}] that was sent to the address "[${request.method}]${request.url}" with body`,
        options?.body,
        `is going to retried due to ${error ? 'an error' : 'a response with status'}`,
        error ?? `${response!.statusText}(${response!.status})`,
      )
      request.headers.set('x-applitools-eyes-client-request-id', `${requestId.split('#', 1)[0]}#${attempt + 1}`)
    },
    async afterResponse({request, response}) {
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')
      logger?.log(
        `Request [${requestId}] that was sent to the address "[${request.method}]${request.url}" respond with ${response.statusText}(${response.status})`,
        !response.ok ? `and body ${JSON.stringify(await response.clone().text())}` : '',
      )
    },
    afterError({request, error}) {
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')
      logger?.error(
        `Request [${requestId}] that was sent to the address "[${request.method}]${request.url}" failed with error`,
        error,
      )
    },
  }
}
