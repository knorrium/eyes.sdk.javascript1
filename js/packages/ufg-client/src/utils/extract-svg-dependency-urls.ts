import {JSDOM} from 'jsdom'
import {extractCssDependencyUrls} from './extract-css-dependency-urls'
import * as utils from '@applitools/utils'

export function extractSvgDependencyUrls(
  svg: string,
  {resourceUrl, sourceUrl}: {resourceUrl: string; sourceUrl?: string},
) {
  const urls = new Set<string>()
  const doc =
    typeof DOMParser === 'function'
      ? new DOMParser().parseFromString(svg, 'image/svg+xml')
      : (new JSDOM(svg).window.document as Document)

  Array.from(doc.querySelectorAll('img[srcset]')).forEach(element => {
    const sources = element.getAttribute('srcset')!.split(', ')
    sources.forEach(source => urls.add(sanitizeUrl(source.trim().split(/\s+/, 1)[0], {baseUrl: resourceUrl})))
  })
  Array.from(doc.querySelectorAll('img[src]')).forEach(element => {
    urls.add(sanitizeUrl(element.getAttribute('src')!, {baseUrl: resourceUrl}))
  })
  Array.from(doc.querySelectorAll('image,use,link[rel="stylesheet"]')).forEach(element => {
    urls.add(sanitizeUrl(element.getAttribute('href')! || element.getAttribute('xlink:href')!, {baseUrl: resourceUrl}))
  })
  Array.from(doc.getElementsByTagName('object')).forEach(element => {
    urls.add(sanitizeUrl(element.getAttribute('data')!, {baseUrl: resourceUrl}))
  })
  Array.from(doc.querySelectorAll('style')).forEach(element => {
    const cssUrls = element.textContent ? extractCssDependencyUrls(element.textContent, {resourceUrl, sourceUrl}) : []
    cssUrls.forEach(url => urls.add(url))
  })
  Array.from(doc.querySelectorAll<SVGElement>('*[style]')).forEach(element => {
    const matches = element.style!.cssText.matchAll(/url\((?!['"]?:)['"]?([^'")]*)['"]?\)/g)
    Array.from(matches).forEach(([, url]) => urls.add(sanitizeUrl(url, {baseUrl: resourceUrl})))
  })

  return [...urls]
}

function sanitizeUrl(url: string, {baseUrl}: {baseUrl: string}): string {
  if (url.startsWith('#')) return baseUrl
  return utils.general.absolutizeUrl(utils.general.toUnAnchoredUri(url), baseUrl)
}
