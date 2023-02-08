import type {Size} from '@applitools/utils'
import type {DriverTarget} from './types'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'

type Options<TSpec extends SpecType> = {
  spec: SpecDriver<TSpec>
  logger: Logger
}

export function makeSetViewportSize<TSpec extends SpecType>({spec, logger: defaultLogger}: Options<TSpec>) {
  return async function setViewportSize({
    target,
    size,
    logger = defaultLogger,
  }: {
    target: DriverTarget<TSpec>
    size: Size
    logger?: Logger
  }) {
    logger.log(`Command "setViewportSize" is called with size`, size)
    const driver = await makeDriver({driver: target, spec, logger})
    return driver.setViewportSize(size)
  }
}
