'use strict'
const {describe, it, before, after} = require('mocha')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')
const {expect} = require('chai')
const applitoolsConfig = require('../fixtures/testApp/applitools.config.js')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-visualGridOptions-globalConfig')

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

describe('works with visualGridOptions from global config', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
    process.chdir(targetTestAppPath)
    await pexec(`yarn`, {
      maxBuffer: 1000000,
    })
  })

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true})
  })

  it('works with visualGriedOptions from applitools.config file', async () => {
    const config = {...applitoolsConfig, visualGridOptions: {polyfillAdoptedStyleSheets: true}}
    fs.writeFileSync(`${targetTestAppPath}/applitools.config.js`, 'module.exports =' + JSON.stringify(config, 2, null))
    const [err, _stdout] = await presult(runCypress('index-run.js', 'visualGridOptionsGlobalConfig.js'))
    try {
      console.log(err)
      expect(err).to.be.undefined
    } catch (ex) {
      console.error('Error during test!', ex.stdout)
      throw ex
    }
  })
})
