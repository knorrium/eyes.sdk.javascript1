import type {ECSession} from '../types'
import {type IncomingMessage, type ServerResponse} from 'http'
import {type Core} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type ReqProxy} from '../req-proxy'
import {makeDriver} from '@applitools/driver'
import * as spec from '@applitools/spec-driver-webdriver'
import * as utils from '@applitools/utils'

type Options = {
  core: Core
  req: ReqProxy
}

export function makeExecuteScript({req, core}: Options) {
  return async function executeScript({
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
    const requestBody = await utils.streams.toJSON(request)

    if (requestBody.script?.startsWith('applitools:')) {
      logger.log(`Custom script execution was intercepted with body:`, requestBody)
      const [options] = requestBody.args ?? []

      if (requestBody.script === 'applitools:startTest') {
        if (session.tests?.current) {
          await session.tests.current.abort({settings: {testMetadata: session.metadata}, logger})
          session.tests.ended ??= []
          session.tests.ended.push(session.tests.current)
          session.tests.current = undefined
        }

        const driver = await makeDriver({
          driver: spec.transformDriver({
            sessionId: session.sessionId,
            serverUrl: session.serverUrl,
            capabilities: session.capabilities,
            proxy: session.proxy,
          }),
          spec,
          logger,
        })
        const environment = await driver.getEnvironment()
        session.tests ??= {}
        session.tests.current = await core.openFunctionalSession({
          settings: {
            eyesServerUrl: session.credentials.eyesServerUrl,
            apiKey: session.credentials.apiKey,
            proxy: session.proxy,
            appName: options?.appName ?? session.options.appName ?? ((await driver.getTitle()) || 'default'),
            testName: options?.testName ?? session.options.testName,
            batch: {...session.options.batch, ...options?.batch},
            environment: {
              hostingApp: `${environment.browserName ?? ''} ${environment.browserVersion ?? ''}`.trim(),
              os: `${environment.platformName ?? ''} ${environment.platformVersion ?? ''}`.trim(),
              deviceName: environment.deviceName,
              viewportSize: await driver.getViewportSize(),
              ecSessionId: session.sessionId,
            },
          },
          logger,
        })
        response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({value: null}))
        return
      } else if (requestBody.script === 'applitools:endTest') {
        if (session.tests?.current) {
          await session.tests.current.close({
            settings: {status: options?.status, testMetadata: session.metadata},
            logger,
          })
          session.tests.ended ??= []
          session.tests.ended.push(session.tests.current)
          session.tests.current = undefined
        }
        response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({value: null}))
        return
      } else if (requestBody.script === 'applitools:getResults') {
        if (session.tests?.ended) {
          const results = await Promise.all(session.tests.ended.map(test => test.getResults({logger})))
          response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({value: results.flat()}))
        } else {
          response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify({value: []}))
        }
        return
      } else if (requestBody.script === 'applitools:metadata') {
        logger.log('Session metadata requested, returning', session.metadata)
        response
          .writeHead(200, {'content-type': 'application/json'})
          .end(JSON.stringify({value: session.metadata ?? []}))
        session.metadata = []
        return
      }
    }

    await req(request.url!, {baseUrl: session.serverUrl, body: requestBody, io: {request, response}, logger})
  }
}
