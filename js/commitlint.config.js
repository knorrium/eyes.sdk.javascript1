const releasePleaseConfig = require('../release-please-config.json')

const types = releasePleaseConfig['changelog-sections'].map(({type}) => type)

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', types],
  },
}
