import {type SpecType, type SpecDriver} from './spec-driver'
import {type Selector, type CommonSelector} from './selector'
import * as utils from '@applitools/utils'

export function isSimpleCommonSelector(selector: any): selector is CommonSelector {
  return utils.types.isString(selector) || isObjectCommonSelector(null, selector)
}

export function isObjectCommonSelector<T extends SpecType>(
  spec: Pick<SpecDriver<T>, 'isSelector'> | null,
  selector: any,
): selector is Exclude<CommonSelector<T['selector']>, string> {
  return (
    utils.types.isPlainObject(selector) &&
    utils.types.has(selector, 'selector') &&
    Object.keys(selector).every(key => ['selector', 'type', 'frame', 'shadow', 'child', 'fallback'].includes(key)) &&
    (utils.types.isString(selector.selector) || !!spec?.isSelector(selector.selector))
  )
}

export function isSelector<T extends SpecType>(
  spec: Pick<SpecDriver<T>, 'isSelector'>,
  selector: any,
): selector is Selector<T> {
  return spec.isSelector(selector) || utils.types.isString(selector) || isObjectCommonSelector(spec, selector)
}

export function transformSelector<T extends SpecType>(
  spec: Pick<SpecDriver<T>, 'isSelector' | 'transformSelector'>,
  selector: Selector<T>,
  environment?: {isWeb?: boolean; isNative?: boolean; isIOS?: boolean; isAndroid?: boolean},
): T['selector'] {
  if (environment?.isWeb && isObjectCommonSelector(spec, selector)) {
    if (selector.type === 'id') selector = {type: 'css', selector: `#${selector.selector}`}
    else if (selector.type === 'name') selector = {type: 'css', selector: `[name="${selector.selector}"]`}
    else if (selector.type === 'class name') selector = {type: 'css', selector: `.${selector.selector}`}
    else if (selector.type === 'tag name') selector = {type: 'css', selector: `${selector.selector}`}
  }
  selector
  return spec.transformSelector?.(selector) ?? (selector as T['selector'])
}

export function splitSelector<T extends SpecType>(
  spec: Pick<SpecDriver<T>, 'isSelector'>,
  selector: Selector<T>,
): {
  contextSelectors: Selector<T>[]
  elementSelector: Selector<T>
} {
  let targetSelector: Selector<T> | null = selector
  let activeSelector = {} as Exclude<CommonSelector<T['selector']>, string>
  let elementSelector = activeSelector
  const contextSelectors = [] as Selector<T>[]
  while (targetSelector) {
    if (isObjectCommonSelector(spec, targetSelector)) {
      activeSelector.selector = targetSelector.selector
      if (targetSelector.type) activeSelector.type = targetSelector.type

      if (targetSelector.child) {
        activeSelector = activeSelector.child = {} as Exclude<CommonSelector<T['selector']>, string>
        targetSelector = targetSelector.child
      } else if (targetSelector.shadow) {
        activeSelector = activeSelector.shadow = {} as Exclude<CommonSelector<T['selector']>, string>
        targetSelector = targetSelector.shadow
      } else if (targetSelector.frame) {
        contextSelectors.push(elementSelector)
        elementSelector = activeSelector = {} as Exclude<CommonSelector<T['selector']>, string>
        targetSelector = targetSelector.frame
      } else {
        targetSelector = null
      }
    } else {
      activeSelector.selector = targetSelector as string | T['selector']
      targetSelector = null
    }
  }

  return {contextSelectors, elementSelector}
}

export function withFastCache<TSpecDriver extends SpecDriver<SpecType>>(spec: TSpecDriver): TSpecDriver {
  const cache = new Map<(...args: any[]) => any, {args: any[]; result: Promise<any>}>()
  return Object.entries(spec).reduce((spec, [name, command]) => {
    spec[name] = (...args: any[]) => {
      const value = cache.get(command)
      if (value?.args.length === args.length && value.args.every((arg, index) => arg === args[index])) {
        return value.result
      } else {
        cache.delete(command)
      }

      const result = command(...args)
      if (!(result instanceof Promise)) return result
      cache.set(command, {args, result})
      return result.finally(() => setImmediate(() => cache.delete(command)))
    }
    return spec
  }, {} as any)
}
