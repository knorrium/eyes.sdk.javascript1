// module.exports = require('./start-test-server');

module.exports = (on, config) => {
  on('task', {
    log(message) {
      console.log(`@@START@@ ${message} @@END@@`)

      return null
    },
  })
}
// eslint-disable-next-line node/no-unpublished-require,node/no-missing-require
require('../../../../../..')(module)
