//APPLITOOLS_UNIVERSAL_DEBUG

'use strict'
const {describe, it, before, after} = require('mocha')
const path = require('path')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')
const applitoolsConfig = require('../fixtures/testApp/applitools.config.js')
const {expect} = require('chai')

const pexec = require('../util/pexec')
const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-fetch-concurrency')

async function runCypress(pluginsFile, testFile) {
  return (
    await pexec(
      `./node_modules/.bin/cypress run --headless --config testFiles=${testFile},integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/${pluginsFile},supportFile=cypress/support/index-run.js`,
      {
        maxBuffer: 10000000,
      },
    )
  ).stdout
}
async function getInfo(stdout) {
  const results = stdout.substring(stdout.indexOf('@@START@@') + '@@START@@'.length, stdout.indexOf('@@END@@'))
  try {
    const config = JSON.parse(results)
    return config.fetchConcurrency
  } catch (ex) {
    console.log(ex)
  }
}

describe('works with fetchConcurrency', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
    process.chdir(targetTestAppPath)
    await pexec(`npm install`, {
      maxBuffer: 1000000,
    })
  })

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true})
  })

  it('send fetchConcurrency to universal', async () => {
    const config = {...applitoolsConfig, eyesFetchConcurrency: 5, failCypressOnDiff: false, universalDebug: true}
    fs.writeFileSync(`${targetTestAppPath}/applitools.config.js`, 'module.exports =' + JSON.stringify(config, 2, null))
    try {
      const [_err, stdout] = await presult(runCypress('get-test-results-for-checkSettings.js', 'fetchConcurrency.js'))
      const fetchConcurrency = await getInfo(stdout)
      expect(fetchConcurrency).to.eq(5)
    } catch (ex) {
      console.error('Error during test!', ex.stdout)
      throw ex
    }
  })
})
