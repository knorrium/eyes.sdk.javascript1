import * as csstree from 'css-tree'
import * as utils from '@applitools/utils'

export function extractCssDependencyUrls(
  css: string,
  {resourceUrl, sourceUrl}: {resourceUrl: string; sourceUrl?: string},
): string[] {
  const urls = new Set<string>()
  const ast = csstree.parse(css, {
    parseRulePrelude: false,
    parseAtrulePrelude: true,
    parseCustomProperty: true,
    parseValue: true,
  })
  csstree.walk(ast, node => {
    if (node.type === 'Atrule' && node.name === 'import' && node.prelude?.type === 'AtrulePrelude') {
      return processImportPrelude(node.prelude, {baseUrl: resourceUrl})
    } else if (node.type === 'Declaration' && node.property.startsWith('--')) {
      return processCustomPropertyValue(node.value, {baseUrl: sourceUrl ?? resourceUrl})
    } else {
      return processCssNode(node, {baseUrl: resourceUrl})
    }
  })

  return [...urls]

  function processCssNode(node: csstree.CssNode, {baseUrl}: {baseUrl: string}) {
    if (node.type === 'Url') {
      urls.add(sanitizeUrl(node.value, {baseUrl}))
      return (csstree.walk as any).skip
    } else if (node.type === 'Function' && node.name.includes('image-set')) {
      node.children.forEach(imageNode => {
        if (imageNode.type === 'Url' || imageNode.type === 'String') urls.add(sanitizeUrl(imageNode.value, {baseUrl}))
      })
      return (csstree.walk as any).skip
    }
  }

  function processImportPrelude(node: csstree.AtrulePrelude, {baseUrl}: {baseUrl: string}) {
    if (node.children.first?.type === 'Url' || node.children.first?.type === 'String') {
      return urls.add(sanitizeUrl(node.children.first.value, {baseUrl}))
    }
    return (csstree.walk as any).skip
  }

  function processCustomPropertyValue(node: csstree.Raw | csstree.Value, {baseUrl}: {baseUrl: string}) {
    csstree.walk(node, node => processCssNode(node, {baseUrl}))
    return (csstree.walk as any).skip
  }
}

function sanitizeUrl(url: string, {baseUrl}: {baseUrl: string}): string {
  return utils.general.absolutizeUrl(utils.general.toUnAnchoredUri(utils.general.toUriEncoding(url)), baseUrl)
}
