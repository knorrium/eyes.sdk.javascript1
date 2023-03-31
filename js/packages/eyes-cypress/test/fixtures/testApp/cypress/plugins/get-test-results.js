module.exports = (on, _config) => {
  on('task', {
    log(message) {
      console.log(message)

      return null
    },
  })
}
// eslint-disable-next-line node/no-unpublished-require,node/no-missing-require
require('../../../../../..')(module)
