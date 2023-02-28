const transformConfig = require('./utils/transform-config')
const transformException = require('./utils/transform-exception')

/**
 * @typedef {import('@applitools/core/types').Eyes} Eyes
 * @param {Object} options
 * @param {Eyes} options.eyes
 */
function makeClose({eyes, config: defaultConfig}) {
  return async function close({throwErr = false, config = defaultConfig} = {}) {
    try {
      const transformedConfig = transformConfig(config)
      await eyes.close({config: transformedConfig})
      const results = await eyes.getResults({settings: {throwErr}})
      if (results.length > 0) return results
      else {
        return [
          {
            userTestId: eyes.test.userTestId,
            name: '',
            steps: 0,
            matches: 0,
            mismatches: 0,
            missing: 0,
            exactMatches: 0,
            strictMatches: 0,
            contentMatches: 0,
            layoutMatches: 0,
            noneMatches: 0,
          },
        ]
      }
    } catch (error) {
      throw transformException(error)
    }
  }
}

module.exports = makeClose
