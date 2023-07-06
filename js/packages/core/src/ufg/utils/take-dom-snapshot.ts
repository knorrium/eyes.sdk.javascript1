import {type Logger} from '@applitools/logger'
import {type SpecType, type Context, type Cookie} from '@applitools/driver'
import {type DomSnapshot} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

const {
  getProcessPagePoll,
  getPollResult,
  getProcessPagePollForIE,
  getPollResultForIE,
} = require('@applitools/dom-snapshot')

export type RawDomSnapshot = {
  url: string
  selector: string
  cdt: {attributes: {name: string; value: string}[]}[]
  crossFrames?: {selector: string; index: number}[]
  frames: RawDomSnapshot[]
  resourceUrls: string[]
  blobs: {url: string; value?: string}[]
  srcAttr: string | null
  scriptVersion: string
}

export type DomSnapshotSettings = {
  disableBrowserFetching?: boolean
  skipResources?: string[]
  chunkByteLength?: number
  executionTimeout?: number
  pollTimeout?: number
  showLogs?: boolean
}

export async function takeDomSnapshot<TSpec extends SpecType>({
  context,
  settings,
  logger,
}: {
  context: Context<TSpec>
  settings?: DomSnapshotSettings
  logger: Logger
}): Promise<DomSnapshot> {
  const driver = context.driver
  const environment = await driver.getEnvironment()
  const features = await driver.getFeatures()
  const cookies: Cookie[] = features.allCookies ? await driver.getCookies().catch(() => []) : []

  const snapshot = transformRawDomSnapshot(await takeContextDomSnapshot({context}))
  snapshot.cookies = cookies
  return snapshot

  async function takeContextDomSnapshot({context}: {context: Context<TSpec>}): Promise<RawDomSnapshot> {
    // logger.log(`taking dom snapshot. ${context._reference ? `context referece: ${JSON.stringify(context._reference)}` : ''}`)

    if (!features.allCookies) {
      cookies.push(...(await context.getCookies()))
    }

    const isLegacyBrowser = environment.isIE || environment.isEdgeLegacy

    const arg = {
      dontFetchResources: settings?.disableBrowserFetching,
      skipResources: settings?.skipResources,
      removeReverseProxyURLPrefixes: Boolean(process.env.APPLITOOLS_SCRIPT_REMOVE_REVERSE_PROXY_URL_PREFIXES),
      chunkByteLength:
        settings?.chunkByteLength ??
        (Number(process.env.APPLITOOLS_SCRIPT_RESULT_MAX_BYTE_LENGTH) ||
          (environment.isIOS ? 100_000 : 250 * 1024 * 1024)),
      serializeResources: true,
      compressResources: false,
      showLogs: settings?.showLogs,
    }
    const scripts = {
      main: features.canExecuteOnlyFunctionScripts
        ? require('@applitools/dom-snapshot').processPagePoll
        : `return (${
            isLegacyBrowser ? await getProcessPagePollForIE() : await getProcessPagePoll()
          }).apply(null, arguments);`,
      poll: features.canExecuteOnlyFunctionScripts
        ? require('@applitools/dom-snapshot').pollResult
        : `return (${isLegacyBrowser ? await getPollResultForIE() : await getPollResult()}).apply(null, arguments);`,
    }

    const snapshot: RawDomSnapshot = await context.executePoll(scripts, {
      main: arg,
      poll: arg,
      executionTimeout: settings?.executionTimeout ?? 5 * 60 * 1000,
      pollTimeout: settings?.pollTimeout ?? 200,
    })

    const crossFrames = extractCrossFrames({snapshot, logger})
    for (const {reference, parentSnapshot, cdtNode} of crossFrames) {
      const frameContext = await context
        .context(reference)
        .then(context => context.focus())
        .catch(err => {
          const srcAttr = cdtNode.attributes.find(attr => attr.name === 'src')
          if (srcAttr) srcAttr.value = ''
          logger.log(
            `could not switch to frame during takeDomSnapshot. Path to frame: ${JSON.stringify(reference)}`,
            err,
          )
        })

      if (frameContext) {
        const frameSnapshot = await takeContextDomSnapshot({context: frameContext as Context<TSpec>})
        let url = new URL(frameSnapshot.url)
        if (url.protocol === 'data:') url = new URL(`http://data-url-frame${url.search}`)
        if (!url.searchParams.has('applitools-iframe')) url.searchParams.set('applitools-iframe', utils.general.guid())
        frameSnapshot.url = url.href
        parentSnapshot.frames.push(frameSnapshot)
        cdtNode.attributes.push({name: 'data-applitools-src', value: frameSnapshot.url})
      }
    }

    logger.log(`dom snapshot cdt length: ${snapshot.cdt.length}`)
    logger.log(`blobs urls (${snapshot.blobs.length}):`, JSON.stringify(snapshot.blobs.map(({url}) => url)))
    logger.log(`resource urls (${snapshot.resourceUrls.length}):`, JSON.stringify(snapshot.resourceUrls))
    return snapshot
  }
}

function transformRawDomSnapshot(snapshot: RawDomSnapshot): DomSnapshot {
  const {blobs, selector: _, crossFrames: __, ...rest} = snapshot
  return {
    ...rest,
    resourceContents: blobs.reduce((resourceContents, blob) => {
      return {
        ...resourceContents,
        [blob.url]: blob,
      }
    }, {}),
    frames: snapshot.frames.map(frameSnapshot => transformRawDomSnapshot(frameSnapshot)),
  } as DomSnapshot
}

export function extractCrossFrames({
  snapshot,
  parent = null,
  logger,
}: {
  snapshot: RawDomSnapshot
  parent?: any
  logger: Logger
}): {cdtNode: RawDomSnapshot['cdt'][number]; reference: any; parentSnapshot: RawDomSnapshot}[] {
  const crossFrames = [snapshot, ...(snapshot.frames ?? [])].flatMap((snapshot, index) => {
    const crossFrames = (snapshot.crossFrames ?? []).map(({selector, index}) => ({
      reference: {reference: {type: 'css', selector}, parent},
      parentSnapshot: snapshot,
      cdtNode: snapshot.cdt[index],
    }))
    return [
      ...crossFrames,
      ...(index > 0
        ? extractCrossFrames({
            snapshot,
            parent: {reference: {type: 'css', selector: snapshot.selector}, parent},
            logger,
          })
        : []),
    ]
  })

  logger.log(
    `frames paths for ${snapshot.crossFrames}`,
    crossFrames.map(selector => JSON.stringify(selector)).join(' , '),
  )

  return crossFrames
}
