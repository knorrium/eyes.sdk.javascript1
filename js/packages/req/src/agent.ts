import type {KeepAliveOptions, Proxy} from './types.js'
import {parse as urlToHttpOptions} from 'url' // should be replaced with `urlToHttpOptions` after supporting node >=16
import {Agent as HttpAgent} from 'http'
import {Agent as HttpsAgent} from 'https'
import {lookupWithCache} from './dns-cache.js'
import createHttpProxyAgent from 'http-proxy-agent'
import createHttpsProxyAgent from 'https-proxy-agent'
import * as utils from '@applitools/utils'

export function makeAgent({
  proxy,
  useDnsCache,
  keepAliveOptions,
}: {
  proxy?: Proxy | undefined | ((url: URL) => Proxy | undefined)
  useDnsCache?: boolean
  keepAliveOptions?: KeepAliveOptions
}) {
  return function agent(url: URL) {
    const proxyOptions = utils.types.isFunction(proxy) ? proxy(url) : proxy
    const lookup = useDnsCache ? lookupWithCache : undefined
    if (proxyOptions) {
      const proxyUrl = new URL(proxyOptions.url)
      proxyUrl.username = proxyOptions.username ?? proxyUrl.username
      proxyUrl.password = proxyOptions.password ?? proxyUrl.password
      const options = {...urlToHttpOptions(proxyUrl.href), rejectUnauthorized: false, lookup}
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
      return new HttpsAgent({rejectUnauthorized: false, lookup, ...keepAliveOptions})
    } else if (url.protocol === 'http:') {
      // @ts-expect-error due to a wrong type definition for node 12, already fixed in newer versions
      return new HttpAgent({lookup, ...keepAliveOptions})
    }
  }
}
