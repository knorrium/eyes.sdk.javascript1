'use strict'
const {describe, it, before, after} = require('mocha')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')
const {getTestInfo} = require('@applitools/test-utils')
const {expect} = require('chai')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-checkSettings-openConfig')

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
  const results = stdout
    .substring(stdout.indexOf('@@START@@') + '@@START@@'.length, stdout.indexOf('@@END@@'))
    .replace('Summary results: ', '')

  const summary = JSON.parse(results)
  return getTestInfo(summary[0].result, process.env.APPLITOOLS_API_KEY)
}

function checkProps(info) {
  expect(info.actualAppOutput[0].accessibilityStatus.level).to.eq('AAA')
  expect(info.actualAppOutput[0].accessibilityStatus.version).to.eq('WCAG_2_0')
  expect(info.actualAppOutput[0].image.hasDom).to.eq(true)
  expect(info.actualAppOutput[0].imageMatchSettings.enablePatterns).to.eq(true)
  expect(info.actualAppOutput[0].imageMatchSettings.useDom).to.eq(true)
  expect(info.actualAppOutput[0].imageMatchSettings.ignoreCaret).to.eq(true)
  expect(info.actualAppOutput[0].imageMatchSettings.ignoreDisplacements).to.eq(true)
  expect(info.actualAppOutput[0].imageMatchSettings.matchLevel).to.eq('Layout2')
  expect(info.startInfo.environment.hostingApp).to.contain('Firefox')
  expect(info.startInfo.environment.displaySize).to.deep.equal({width: 500, height: 500})
  expect(info.startInfo.batchInfo.name).to.eq('CheckSettings with open config')
  expect(info.startInfo.batchInfo.batchSequenceName).to.eq('CheckSettings - open config')
  expect(info.startInfo.batchInfo.notifyOnCompletion).to.eq(true)
}

describe('works with checkSettings in open', () => {
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

  it('checkSettings works from open file', async () => {
    try {
      const [_err, stdout] = await presult(runCypress('get-test-results-for-checkSettings.js', 'checkSettingsOpen.js'))
      const info = await getInfo(stdout)
      checkProps(info)
    } catch (ex) {
      console.error('Error during test!', ex.stdout)
      throw ex
    }
  })
})
