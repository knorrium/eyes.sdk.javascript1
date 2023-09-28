import type {CheckSettings} from '../types'
import {promises as fs} from 'fs'
import {req} from '@applitools/req'
import * as utils from '@applitools/utils'

// NOTE:
//
// There was much debate about whether to start transforming CheckSettings
// and whether or not domMapping should live on `target` or `settings`.
//
// Where we landed was this - we didn't want to create a general input
// transformation point in the code base. The compromise was to separate this
// transform out into a separate function, making it explicit, and to reference
// the rationale in a code comment (:wave:).
//
// For details, you can see the discussion in this PR,
// starting at this specific comment:
// https://github.com/applitools/eyes.sdk.javascript1/pull/1886#issuecomment-1700418265
//
export async function transformDomMapping(settings: CheckSettings): Promise<void> {
  if (utils.types.isString(settings.domMapping)) {
    const str = settings.domMapping
    if (utils.types.isHttpUrl(str)) {
      const response = await req(str, {proxy: settings.autProxy})
      settings.domMapping = Buffer.from(await response.arrayBuffer())
    } else {
      settings.domMapping = await fs.readFile(str)
    }
  }
}
