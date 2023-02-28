const transformConfig = require('./utils/transform-config')

function makeExtractText({core, config: defaultConfig, target}) {
  return async function extractText({regions, config = defaultConfig} = {}) {
    const transformedConfig = transformConfig(config)
    const settings = regions.map(region => ({...region, region: region.target}))
    return core.extractText({settings, config: transformedConfig, target})
  }
}

module.exports = makeExtractText
