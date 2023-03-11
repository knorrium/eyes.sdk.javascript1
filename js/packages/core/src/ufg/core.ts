import type {Core} from './types'
import type {Core as BaseCore} from '@applitools/core-base'
import {type UFGClient} from '@applitools/ufg-client'
import {type NMLClient} from '@applitools/nml-client'
import {type SpecType, type SpecDriver} from '@applitools/driver'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeCore as makeBaseCore} from '@applitools/core-base'
import {makeGetViewportSize} from '../automation/get-viewport-size'
import {makeSetViewportSize} from '../automation/set-viewport-size'
import {makeLocate} from '../automation/locate'
import {makeLocateText} from '../automation/locate-text'
import {makeExtractText} from '../automation/extract-text'
import {makeGetUFGClient} from './get-ufg-client'
import {makeGetNMLClient} from './get-nml-client'
import {makeOpenEyes} from './open-eyes'
import * as utils from '@applitools/utils'
import throat from 'throat'

type Options<TSpec extends SpecType> = {
  concurrency: number
  spec?: SpecDriver<TSpec>
  clients?: {ufg?: UFGClient; nml?: NMLClient}
  base?: BaseCore
  agentId?: string
  cwd?: string
  logger?: Logger
}

export function makeCore<TSpec extends SpecType>({
  concurrency,
  spec,
  clients,
  base,
  agentId = 'core-ufg',
  cwd = process.cwd(),
  logger: defaultLogger,
}: Options<TSpec>): Core<TSpec> {
  const logger = defaultLogger?.extend({label: 'core-ufg'}) ?? makeLogger({label: 'core-ufg'})
  logger.log(`Core ufg is initialized ${base ? 'with' : 'without'} custom base core`)

  base ??= makeBaseCore({agentId, cwd, logger})
  return utils.general.extend(base, core => {
    const throttle = throat(concurrency)
    return {
      type: 'ufg' as const,
      base: utils.general.extend(base!, {
        // open eyes with concurrency
        openEyes: utils.general.wrap(base!.openEyes, (openEyes, options) => {
          return new Promise((resolve, rejects) => {
            throttle(() => {
              return new Promise<void>(async done => {
                try {
                  const eyes = await openEyes(options)
                  resolve(
                    utils.general.extend(eyes, {
                      // release concurrency slot when closed
                      close: utils.general.wrap(eyes.close, (close, options) => close(options).finally(done)),
                      // release concurrency slot when aborted
                      abort: utils.general.wrap(eyes.abort, (abort, options) => abort(options).finally(done)),
                      // release concurrency slot when checkAndClose is done
                      checkAndClose: utils.general.wrap(eyes.checkAndClose, (checkAndClose, options) =>
                        checkAndClose(options).finally(done),
                      ),
                    }),
                  )
                } catch (error) {
                  rejects(error)
                  // release concurrency slot when error thrown
                  done()
                }
              })
            })
          })
        }),
      }),
      getViewportSize: spec && makeGetViewportSize({spec, logger}),
      setViewportSize: spec && makeSetViewportSize({spec, logger}),
      locate: makeLocate({spec, core, logger}),
      locateText: makeLocateText({spec, core, logger}),
      extractText: makeExtractText({spec, core, logger}),
      getUFGClient: makeGetUFGClient({client: clients?.ufg, logger}),
      getNMLClient: makeGetNMLClient({client: clients?.nml, logger}),
      openEyes: makeOpenEyes({spec, core, logger}),
    }
  })
}
