import {type SpecType, type SpecDriver} from './spec-driver'
import * as utils from '@applitools/utils'

export type Selector<T extends SpecType = never> =
  | T['selector']
  | T['secondary']['selector']
  | CommonSelector<T['selector'] | T['secondary']['selector']>

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
  spec?: Pick<SpecDriver<T>, 'isSelector' | 'isSecondarySelector'>,
): selector is Selector<T> {
  return (
    spec?.isSelector(selector) ||
    spec?.isSecondarySelector?.(selector) ||
    utils.types.isString(selector) ||
    isComplexSelector(selector, spec)
  )
}

export function isComplexSelector<T extends SpecType>(
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
  return utils.types.isString(selector) || isComplexSelector(selector)
}

export function makeSelector<T extends SpecType>(options: {
  selector: Selector<T>
  spec: Pick<SpecDriver<T>, 'isSelector' | 'toSelector'>
  environment?: {isWeb?: boolean; isNative?: boolean; isIOS?: boolean; isAndroid?: boolean}
}): T['selector'] {
  const {spec, environment} = options
  let selector = options.selector
  if (environment?.isWeb && isComplexSelector(selector, spec)) {
    if (selector.type === 'id') selector = {type: 'css', selector: `#${selector.selector}`}
    else if (selector.type === 'name') selector = {type: 'css', selector: `[name="${selector.selector}"]`}
    else if (selector.type === 'class name') selector = {type: 'css', selector: `.${selector.selector}`}
    else if (selector.type === 'tag name') selector = {type: 'css', selector: `${selector.selector}`}
  }
  return spec.toSelector?.(selector) ?? (selector as T['selector'])
}
