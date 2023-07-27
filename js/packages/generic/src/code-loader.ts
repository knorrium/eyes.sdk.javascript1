import type {BinaryExpression, VariableDeclarator} from '@babel/types'
import {transformAsync, type PluginTarget, type NodePath} from '@babel/core'
import {readFile} from 'fs/promises'
import * as utils from '@applitools/utils'

interface Context {
  parentURL?: string
  importAssertions?: {format?: string; fixtures?: string}
}

type Next = (specifier: string, context: Context) => any

export async function resolve(specifier: string, context: Context, next: Next) {
  let url: string | undefined
  if (utils.types.isHttpUrl(specifier)) {
    url = specifier
  } else if (utils.types.isHttpUrl(context.parentURL)) {
    url = new URL(specifier, context.parentURL).href
  }

  return url ? {url, shortCircuit: true} : next(specifier, context)
}

export async function load(url: string, context: Context, next: Next) {
  let source: string | undefined, format: string | undefined

  if (utils.types.isHttpUrl(url)) {
    const response = await fetch(url)
    if (response.status !== 200) throw new Error(`Failed to load module '${url}' due to ${response.status} status code`)
    format = response.headers.get('content-type')?.startsWith('application/json') ? 'json' : 'module'
    source = await response.text()
  }

  if (context.importAssertions?.format === 'template') {
    format ??= 'module'
    source ??= await readFile(new URL(url), {encoding: 'utf8'})
    source = await transformTemplate(source)
  } else if (context.importAssertions?.format === 'tests') {
    format ??= 'module'
    source ??= await readFile(new URL(url), {encoding: 'utf8'})
    source = await transformTests(source)
  }

  if (format && source) return {format, source, shortCircuit: true}

  return next(url, context)
}

async function transformTemplate(source: string): Promise<string> {
  const url = import.meta.url
  return `const {default: handlebars} = await import(await import.meta.resolve('handlebars', '${url}'))\nhandlebars.registerHelper('tags', (context, options) => !context || context.length <= 0 ? '' : \` (\${context.map(options.fn).join(' ')})\`)\nexport const template = handlebars.compile(\`${source}\`, {noEscape: true})`
}

async function transformTests(source: string): Promise<string> {
  const transformer: PluginTarget = ({types: t}) => {
    const operators = {'+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '**': 'pow'}
    return {
      visitor: {
        BinaryExpression(path: NodePath<BinaryExpression>) {
          if (!shouldTransform(path)) return
          if (utils.types.has(operators, path.node.operator)) {
            path.replaceWith(
              t.callExpression(t.identifier(`this.operators.${operators[path.node.operator]}`), [
                path.node.left,
                path.node.right,
              ]),
            )
          }
        },
        VariableDeclarator(path: NodePath<VariableDeclarator>) {
          if (!path.node.init) return
          if (!shouldTransform(path)) return
          if (path.node.id.type === 'Identifier') {
            path.node.init = t.callExpression(t.identifier('this.ref'), [
              t.stringLiteral(path.node.id.name),
              path.node.init,
            ])
          }
        },
      },
    }

    function shouldTransform(path: NodePath) {
      return !!path.findParent(path => {
        if (path.isObjectMethod()) {
          return path.node.key.type === 'Identifier' && path.node.key.name === 'test'
        } else if (path.isFunctionExpression()) {
          return path.node.id?.type === 'Identifier' && path.node.id.name === 'test'
        } else {
          return false
        }
      })
    }
  }

  const url = import.meta.url
  const code = `export async function emit(options) {\nconst {makeFramework} = await import(await import.meta.resolve('./framework.js', '${url}'))\nconst {config, test, fixture, emit} = makeFramework(options)\n${source}\nreturn emit(options)\n}`
  const transformed = await transformAsync(code, {configFile: false, plugins: [transformer]})
  return transformed?.code ?? source
}
