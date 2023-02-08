import {type SpecType} from './spec-driver'

export type Selector<T extends SpecType = never> = T['selector'] | string | CommonSelector<T>

export type CommonSelector<T extends SpecType = never> = {
  selector: T['selector'] | string
  type?: string
  child?: T['selector'] | string | CommonSelector<T>
  shadow?: T['selector'] | string | CommonSelector<T>
  frame?: T['selector'] | string | CommonSelector<T>
  fallback?: T['selector'] | string | CommonSelector<T>
}
