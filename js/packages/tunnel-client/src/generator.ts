import type {TunnelClientWorkerSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeReq} from '@applitools/req'
import * as utils from '@applitools/utils'

export async function* makeGenerator({
  settings,
}: {
  settings: TunnelClientWorkerSettings
  logger: Logger
}): AsyncGenerator<Record<string, any>[], Record<string, any>[], Record<string, any>[]> {
  const req = makeReq({
    baseUrl: settings.pollingServerUrl,
    retry: {
      validate: ({response, error}) => response?.status !== 200 && !utils.types.instanceOf(error, 'AbortError'),
    },
    timeout: settings.timeout ?? 5 * 60_000,
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
              response = {resource_content: message.payload.result.toString('base64')}
            }
            return {id: message.key, status: 'SUCCESS', response}
          }
        }),
        agent_status: 'OK',
      },
    })
    const result: any = await response.json()

    if (result.abort) {
      return [{name: 'TunnelClient.close', payload: {reason: result.abort_reason}}]
    } else {
      const incomingRequestMessages = result.tasks.flatMap((task: any) => {
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
            payload: {
              tunnelId: task.tunnel_id,
              credentials: {apiKey: task.apiKey, eyesServerUrl: task.eyesServerUrl},
            },
          }
        } else if (task.type === 'REPLACE_TUNNEL') {
          return {
            name: 'TunnelClient.replace',
            key: task.id,
            payload: {
              tunnelId: task.tunnel_id,
              credentials: {apiKey: task.apiKey, eyesServerUrl: task.eyesServerUrl},
            },
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
    }

    await utils.general.sleep(result.polling_interval_sec * 1000)
  }
}
