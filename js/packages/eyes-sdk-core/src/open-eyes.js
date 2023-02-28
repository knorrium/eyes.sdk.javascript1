const transformConfig = require('./utils/transform-config')
const makeCheck = require('./check')
const makeLocate = require('./locate')
const makeExtractText = require('./extract-text')
const makeExtractTextRegions = require('./extract-text-regions')
const makeClose = require('./close')
const makeAbort = require('./abort')

function makeOpenEyes({manager, core}) {
  return async function openEyes({driver, config, logger}) {
    const transformedConfig = transformConfig(config)
    const eyes = await manager.openEyes({target: driver, config: transformedConfig, logger})

    return {
      check: makeCheck({eyes, config}),
      locate: makeLocate({core, config, driver}),
      extractText: makeExtractText({core, config, target: driver}),
      extractTextRegions: makeExtractTextRegions({core, config, target: driver}),
      close: makeClose({eyes, config}),
      abort: makeAbort({eyes, config}),
    }
  }
}

module.exports = makeOpenEyes
