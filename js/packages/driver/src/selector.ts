import {type SpecType} from './spec-driver'

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
