import {type Logger} from '@applitools/logger'
import {type Context} from '@applitools/driver'
import {lazyLoad as lazyLoadScript} from '@applitools/snippets'

export type LazyLoadSettings = {
  scrollLength?: number
  waitingTime?: number
  maxAmountToScroll?: number
  executionTimeout?: number
  pollTimeout?: number
}

export async function waitForLazyLoad<TContext extends Context<unknown, unknown, unknown, unknown>>({
  context,
  settings,
  logger,
}: {
  context: TContext
  settings: LazyLoadSettings
  logger: Logger
}) {
  logger.log('lazy loading the page before capturing a screenshot')

  await context.executePoll(lazyLoadScript, {
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
