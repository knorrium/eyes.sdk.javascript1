'use strict'
const {describe, it, before, after} = require('mocha') // eslint-disable-line
const {expect} = require('chai')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')
const applitoolsConfig = require('../fixtures/testApp/applitools.config.js')
const snap = require('@applitools/snaptdout')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-getResults')

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

function parseResults(stdout) {
  const results = stdout.substring(stdout.indexOf('@@START@@') + '@@START@@'.length, stdout.indexOf('@@END@@'))
  return JSON.parse(results)
}

describe('get results', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    try {
      await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
      process.chdir(targetTestAppPath)
      await pexec(`yarn`, {
        maxBuffer: 1000000,
      })
    } catch (ex) {
      console.log(ex)
      throw ex
    }
  })

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true})
  })

  it('return test results using eyesGetResults', async () => {
    const [err, v] = await presult(runCypress('log-plugin.js', 'getResults.js'))
    expect(err).to.be.undefined
    debugger
    const [results] = parseResults(v)
    expect(results.appName).to.equal('test result 2')
    expect(results.name).to.equal('some test 2')
  })

  it('getResults fail test when throwErr is not false', async () => {
    const config = {...applitoolsConfig, failCypressOnDiff: false}
    fs.writeFileSync(`${targetTestAppPath}/applitools.config.js`, 'module.exports =' + JSON.stringify(config, 2, null))
    const [err, _v] = await presult(runCypress('log-plugin.js', 'getResultsWithDiffs.js'))
    snap(err.stdout, 'getResults fail test when throwErr is not false')
  })
})
