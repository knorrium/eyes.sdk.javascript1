'use strict'
const {describe, it, before, after} = require('mocha')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-disableBrowserFetching')

async function runCypress() {
  return (
    await pexec(`./node_modules/.bin/cypress run`, {
      maxBuffer: 10000000,
    })
  ).stdout
}

async function updateConfigFile(pluginFileName, testName = 'global-hooks-overrides.js') {
  const promise = new Promise(resolve => {
    fs.readFile(path.resolve(targetTestAppPath, `./cypress.config.js`), 'utf-8', function (err, contents) {
      if (err) {
        console.log(err)
        return
      }

      const replaced = contents
        .replace(/index-run.js/g, pluginFileName)
        .replace(/integration-run/g, `integration-run/${testName}`)

      fs.writeFile(path.resolve(targetTestAppPath, `./cypress.config.js`), replaced, 'utf-8', function (err) {
        if (err) {
          console.log(err)
        }
        resolve()
      })
    })
  })
  await promise
}

describe('disableBrowserFetching', () => {
  beforeEach(async () => {
    await pexec(`cp ${sourceTestAppPath}Cypress10/cypress.config.js ${targetTestAppPath}`)
    const applitoolsConfig = require(path.resolve(targetTestAppPath, `./applitools.config.js`))
    applitoolsConfig.disableBrowserFetching = true
    fs.writeFileSync(
      path.resolve(targetTestAppPath, `./applitools.config.js`),
      `module.exports = ${JSON.stringify(applitoolsConfig)}`,
    )
  })
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
    fs.unlinkSync(`${targetTestAppPath}/cypress.json`)
    process.chdir(targetTestAppPath)
    await pexec(`yarn`, {
      maxBuffer: 1000000,
    })
    await pexec('yarn add cypress@latest')
  })

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true})
  })

  it('works for disableBrowserFetching.js', async () => {
    try {
      await updateConfigFile('index-run.js', 'disableBrowserFetching.js')
      await runCypress()
    } catch (ex) {
      console.error('Error during test!', ex.stdout)
      throw ex
    }
  })
})
