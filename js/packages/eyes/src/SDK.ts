import {makeCore as makeDefaultCore, type Core, type SpecType, type SpecDriver} from '@applitools/core'
import * as utils from '@applitools/utils'

export interface SDK<TSpec extends SpecType = SpecType> {
  spec?: SpecDriver<TSpec>
  agentId?: string
  environment?: Record<string, any>
  makeCore?: typeof makeDefaultCore
}

export function initSDK<TSpec extends SpecType = SpecType>(
  options?: SDK<TSpec>,
): {core: Core<TSpec, 'classic' | 'ufg'>; spec?: SpecDriver<TSpec>} {
  return {
    core: getCoreWithCache(options),
    spec: options?.spec,
  }
}

const getCoreWithCache = utils.general.cachify(getCore)
function getCore<TSpec extends SpecType = SpecType>({makeCore = makeDefaultCore, ...options}: SDK<TSpec> = {}): Core<
  TSpec,
  'classic' | 'ufg'
> {
  options.agentId ??= `js/eyes/${require('../package.json').version}`
  return makeCore(options)
}
