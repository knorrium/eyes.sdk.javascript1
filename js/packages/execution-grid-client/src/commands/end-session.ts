import type {ECSession} from '../types'
import {type IncomingMessage, type ServerResponse} from 'http'
import {type Logger} from '@applitools/logger'
import {type ReqProxy} from '../req-proxy'
import {type TunnelManager} from '../tunnels/manager'

type Options = {
  req: ReqProxy
  tunnels?: TunnelManager
}

export function makeEndSession({req, tunnels}: Options) {
  return async function endSession({
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
    logger.log(`Request was intercepted with sessionId:`, session.sessionId)

    await req(request.url as string, {body: null, io: {request, response}, logger})

    if (session.tests?.current) {
      await session.tests.current.abort({settings: {testMetadata: session.metadata}, logger})
      session.tests.ended ??= []
      session.tests.ended.push(session.tests.current)
      session.tests.current = undefined
    }
    if (session.tunnels && tunnels) {
      await tunnels.release(session.tunnels)
      logger.log(
        `Tunnels with id ${session.tunnels.map(tunnel => tunnel.tunnelId)} was released for session with id ${
          session.sessionId
        }`,
      )
    }
  }
}
