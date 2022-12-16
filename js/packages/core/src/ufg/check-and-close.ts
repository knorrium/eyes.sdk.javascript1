import type {DriverTarget, Eyes} from './types'
import {type AbortSignal} from 'abort-controller'
import {type Logger} from '@applitools/logger'
import {type SpecDriver} from '@applitools/driver'
import {type UFGClient} from '@applitools/ufg-client'

type Options<TDriver, TContext, TElement, TSelector> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector>
  client: UFGClient
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  signal?: AbortSignal
  logger?: Logger
}

export function makeCheckAndClose<TDriver, TContext, TElement, TSelector>(
  _options: Options<TDriver, TContext, TElement, TSelector>,
) {
  return null
}
