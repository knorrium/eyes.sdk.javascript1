import {type Logger} from '@applitools/logger'
import {type SpecType, type Context} from '@applitools/driver'
import {type LazyLoadOptions} from '../types'

const {lazyLoad} = require('@applitools/snippets')

export async function waitForLazyLoad<TSpec extends SpecType>({
  context,
  settings,
  logger,
}: {
  context: Context<TSpec>
  settings: LazyLoadOptions & {
    pollTimeout?: number
    waitingTime?: number
  }
  logger: Logger
}) {
  logger.log('lazy loading the page before capturing a screenshot')
  const {
    scrollLength = 300,
    waitingTime = 2000,
    maxAmountToScroll = 15000,
  } = typeof settings === 'boolean' ? {} : settings

  await context.executePoll(lazyLoad, {
    main: [
      await context.getScrollingElement(),
      {
        scrollLength: scrollLength,
        waitingTime: waitingTime,
        maxAmountToScroll: maxAmountToScroll,
      },
    ],
    poll: [],
    executionTimeout: 5 * 60 * 1000,
    pollTimeout: settings.pollTimeout ?? settings.waitingTime ?? 2000,
  })
}
