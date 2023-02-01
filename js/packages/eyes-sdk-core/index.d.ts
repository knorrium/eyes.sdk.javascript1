import {Core} from '@applitools/core'
import {SpecDriver} from '@applitools/driver'

export function makeSDK<TDriver, TContext, TElement, TSelector>(options: {
  name: string
  version: string
  cwd?: string
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>
}): Core<TDriver, TElement, TSelector, TContext>

export {Core} from '@applitools/core'

export function checkSpecDriver<TDriver, TContext, TElement, TSelector>(options: {
  spec: SpecDriver<TDriver, TContext, TElement, TSelector>,
  driver: TDriver
}): Promise<any>
