import {type SpecType, type SpecDriver} from './spec-driver'
import * as utils from '@applitools/utils'

export type Selector<T extends SpecType = never> = T['selector'] | CommonSelector<T['selector']>

export type CommonSelector<TSelector = never> = string | ComplexSelector<TSelector>

type ComplexSelector<TSelector> = {
  selector: TSelector | string
  type?: string
  child?: TSelector | string | CommonSelector<TSelector>
  shadow?: TSelector | string | CommonSelector<TSelector>
  frame?: TSelector | string | CommonSelector<TSelector>
  fallback?: TSelector | string | CommonSelector<TSelector>
}

export function isSelector<T extends SpecType>(
  selector: any,
  spec?: Pick<SpecDriver<T>, 'isSelector'>,
): selector is Selector<T> {
  return spec?.isSelector(selector) || utils.types.isString(selector) || isObjectCommonSelector(selector, spec)
}

export function isObjectCommonSelector<T extends SpecType>(
  selector: any,
  spec?: Pick<SpecDriver<T>, 'isSelector'>,
): selector is Exclude<CommonSelector<T['selector']>, string> {
  return (
    utils.types.isPlainObject(selector) &&
    utils.types.has(selector, 'selector') &&
    Object.keys(selector).every(key => ['selector', 'type', 'frame', 'shadow', 'child', 'fallback'].includes(key)) &&
    (utils.types.isString(selector.selector) || !!spec?.isSelector(selector.selector))
  )
}

export function isSimpleCommonSelector(selector: any): selector is CommonSelector {
  return utils.types.isString(selector) || isObjectCommonSelector(selector)
}
