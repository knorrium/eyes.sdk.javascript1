import type {Renderer} from '../types'
import {type SpecType, type Driver} from '@applitools/driver'

export async function extractDefaultRenderers<TSpec extends SpecType>({
  driver,
}: {
  driver?: Driver<TSpec>
}): Promise<Renderer[]> {
  if (!driver) return []

  const currentContext = driver.currentContext
  try {
    const environment = await driver.getEnvironment()

    if (environment.isWeb) {
      const viewportSize = await driver.getViewportSize()
      return [{name: 'chrome' as const, ...viewportSize}]
    } else {
      return []
    }
  } finally {
    await currentContext.focus()
  }
}
