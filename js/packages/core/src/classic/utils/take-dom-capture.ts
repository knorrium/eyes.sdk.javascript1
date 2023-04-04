import {type SpecType, type Driver, type Context} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {req, type Fetch} from '@applitools/req'

const {
  getCaptureDomPoll,
  getPollResult,
  getCaptureDomPollForIE,
  getPollResultForIE,
} = require('@applitools/dom-capture')

export type DomCaptureSettings = {
  fetch?: Fetch
  fetchTimeout?: number
  executionTimeout?: number
  pollTimeout?: number
  chunkByteLength?: number
}

export async function takeDomCapture<TSpec extends SpecType>({
  driver,
  settings,
  logger,
}: {
  driver: Driver<TSpec>
  settings?: DomCaptureSettings
  logger: Logger
}) {
  const environment = await driver.getEnvironment()
  const features = await driver.getFeatures()
  const isLegacyBrowser = environment.isIE || environment.isEdgeLegacy
  const arg = {
    chunkByteLength:
      settings?.chunkByteLength ??
      (Number(process.env.APPLITOOLS_SCRIPT_RESULT_MAX_BYTE_LENGTH) ||
        (environment.isIOS ? 100_000 : 250 * 1024 * 1024)),
  }
  const scripts = {
    main: features.canExecuteOnlyFunctionScripts
      ? require('@applitools/dom-capture').captureDomPoll
      : `return (${
          isLegacyBrowser ? await getCaptureDomPollForIE() : await getCaptureDomPoll()
        }).apply(null, arguments);`,
    poll: features.canExecuteOnlyFunctionScripts
      ? require('@applitools/dom-capture').pollResult
      : `return (${isLegacyBrowser ? await getPollResultForIE() : await getPollResult()}).apply(null, arguments);`,
  }

  const url = await driver.getUrl()
  const dom = await captureContextDom(driver.mainContext)

  // TODO save debug DOM like we have for debug screenshots
  return dom

  async function captureContextDom(context: Context<TSpec>): Promise<string> {
    const capture: string = await context.executePoll(scripts, {
      main: arg,
      poll: arg,
      executionTimeout: settings?.executionTimeout ?? 5 * 60 * 1000,
      pollTimeout: settings?.pollTimeout ?? 200,
    })
    if (!capture) return ''
    const raws = capture.split('\n')
    const tokens = JSON.parse(raws[0])
    const cssEndIndex = raws.indexOf(tokens.separator)
    const frameEndIndex = raws.indexOf(tokens.separator, cssEndIndex + 1)
    let dom = raws[frameEndIndex + 1]

    const cssResources = await Promise.all(
      raws.slice(1, cssEndIndex).reduce((cssResources, href) => {
        return href ? cssResources.concat(fetchCssResource(new URL(href, url).href)) : cssResources
      }, [] as Promise<{url: string; css: string}>[]),
    )
    for (const {url, css} of cssResources) {
      dom = dom.replace(`${tokens.cssStartToken}${url}${tokens.cssEndToken}`, css)
    }

    const framePaths = raws.slice(cssEndIndex + 1, frameEndIndex)
    for (const xpaths of framePaths) {
      if (!xpaths) continue
      const references = xpaths.split(',').reduce((parent, selector) => {
        return {reference: {type: 'xpath', selector}, parent}
      }, null as any)
      let contextDom: string
      try {
        const frame = await context.context(references)
        contextDom = await captureContextDom(frame)
      } catch (ignored) {
        logger.log('Switching to frame failed')
        contextDom = ''
      }
      dom = dom.replace(`${tokens.iframeStartToken}${xpaths}${tokens.iframeEndToken}`, contextDom)
    }

    return dom
  }

  async function fetchCssResource(url: string): Promise<{url: string; css: string}> {
    logger.log(`Request to download css will be sent to the address "[GET]${url}"`)
    try {
      const response = await req(url, {
        timeout: settings?.fetchTimeout ?? 60_000,
        retry: {
          limit: 1,
          validate: ({response, error}) => !!error || !response!.ok,
        },
        fetch: settings?.fetch,
      })
      logger.log(
        `Request to download css that was sent to the address "[GET]${url}" respond with ${response.statusText}(${response.status})`,
        response.ok ? `and css of length ${(await response.clone().text()).length} chars` : '',
      )
      return {url, css: response.ok ? encodeJSON(await response.text()) : ''}
    } catch (error) {
      logger.error(`Request to download css that was sent to the address "[GET]${url}" failed with error`, error)
      return {url, css: ''}
    }
  }

  function encodeJSON(str: string) {
    if (!str) return ''
    return Array.from(str).reduce((result, char) => {
      switch (char) {
        case '\\':
        case '"':
        case '/':
          return result + '\\' + char
        case '\b':
          return result + '\\b'
        case '\t':
          return result + '\\t'
        case '\n':
          return result + '\\n'
        case '\f':
          return result + '\\f'
        case '\r':
          return result + '\\r'
        default:
          if (char < ' ') {
            const tmp = '000' + char.charCodeAt(0).toString(16)
            return result + '\\u' + tmp.substring(tmp.length - 4)
          } else {
            return result + char
          }
      }
    }, '')
  }
}
