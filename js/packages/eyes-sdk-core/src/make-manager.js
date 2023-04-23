const makeOpenEyes = require('./open-eyes')
const makeCloseManager = require('./close-manager')

function makeMakeManager({core}) {
  // the setting argument added for typescript type support
  return async function makeManager({type, concurrency, legacyConcurrency, settings} = {}) {
    settings = {concurrency, legacyConcurrency, ...(settings ? settings : {})}
    const manager = await core.makeManager({type: type === 'vg' ? 'ufg' : type, settings})

    return {
      openEyes: makeOpenEyes({core, manager}),
      closeManager: makeCloseManager({manager}),
    }
  }
}

module.exports = makeMakeManager
