import {type Logger} from '@applitools/logger'
import {type SpecType, type Context} from '@applitools/driver'

const {lazyLoad} = require('@applitools/snippets')

export type LazyLoadSettings = {
  scrollLength?: number
  waitingTime?: number
  maxAmountToScroll?: number
  executionTimeout?: number
  pollTimeout?: number
}

export async function waitForLazyLoad<TSpec extends SpecType>({
  context,
  settings,
  logger,
}: {
  context: Context<TSpec>
  settings: LazyLoadSettings
  logger: Logger
}) {
  logger.log('lazy loading the page before capturing a screenshot')

  await context.executePoll(lazyLoad, {
    main: [
      await context.getScrollingElement(),
      {
        scrollLength: settings.scrollLength ?? 300,
        waitingTime: settings.waitingTime ?? 2000,
        maxAmountToScroll: settings.maxAmountToScroll ?? 15000,
      },
    ],
    poll: [],
    executionTimeout: 5 * 60 * 1000,
    pollTimeout: settings.pollTimeout ?? settings.waitingTime ?? 2000,
  })
}
