import type {ECSession} from '../types'
import {type IncomingMessage, type ServerResponse} from 'http'
import {type Logger} from '@applitools/logger'
import {type ReqProxy} from '../req-proxy'

type Options = {
  req: ReqProxy
}

export function makeFindElement({req}: Options) {
  return async function findElement({
    session,
    request,
    response,
    logger,
  }: {
    session: ECSession
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    logger.log('Inspecting element lookup request to collect self-healing metadata')
    const proxyResponse = await req(request.url!, {
      baseUrl: session.serverUrl,
      io: {request, response, handle: false},
      logger,
    })
    const responseBody = new Uint8Array(await proxyResponse.arrayBuffer())
    const parsed = JSON.parse(new TextDecoder().decode(responseBody))
    if (parsed?.appliCustomData?.selfHealing?.successfulSelector) {
      logger.log('Self-healed locators detected', parsed.appliCustomData.selfHealing)
      session.metadata ??= []
      session.metadata.push(parsed.appliCustomData.selfHealing)
    } else {
      logger.log('No self-healing metadata found')
    }
    response
      .writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers.entries()))
      .end(Buffer.from(responseBody))
  }
}
