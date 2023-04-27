import type {Proxy} from './types.js'
import {parse as urlToHttpOptions} from 'url' // should be replaced with `urlToHttpOptions` after supporting node >=16
import {Agent as HttpsAgent} from 'https'
import createHttpProxyAgent from 'http-proxy-agent'
import createHttpsProxyAgent from 'https-proxy-agent'
import * as utils from '@applitools/utils'

export function makeProxyAgent(proxy: Proxy | undefined | ((url: URL) => Proxy | undefined)) {
  return function agent(url: URL) {
    const proxyOptions = utils.types.isFunction(proxy) ? proxy(url) : proxy
    if (proxyOptions) {
      const proxyUrl = new URL(proxyOptions.url)
      proxyUrl.username = proxyOptions.username ?? proxyUrl.username
      proxyUrl.password = proxyOptions.password ?? proxyUrl.password
      const options = {...urlToHttpOptions(proxyUrl.href), rejectUnauthorized: false}
      if (url.protocol === 'https:') {
        const agent = createHttpsProxyAgent(options)
        agent.callback = utils.general.wrap(agent.callback.bind(agent), (fn, request, options, ...rest) => {
          return fn(request, {...options, rejectUnauthorized: false} as typeof options, ...rest)
        })
        return agent
      } else if (url.protocol === 'http:') {
        return createHttpProxyAgent(options)
      }
    } else if (url.protocol === 'https:') {
      return new HttpsAgent({rejectUnauthorized: false})
    }
  }
}
