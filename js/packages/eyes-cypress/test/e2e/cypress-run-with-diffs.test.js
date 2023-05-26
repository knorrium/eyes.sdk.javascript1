'use strict'
const {describe, it, before, after} = require('mocha')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')
const {expect} = require('chai')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-run-wth-diffs')

async function runCypress(pluginsFile, testFile) {
  return (
    await pexec(
      `./node_modules/.bin/cypress run --browser=chrome --headless --config testFiles=${testFile},integrationFolder=cypress/integration-run,pluginsFile=cypress/plugins/${pluginsFile},supportFile=cypress/support/index-run.js`,
      {
        maxBuffer: 10000000,
      },
    )
  ).stdout
}

describe('works for diffs with global hooks', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    try {
      await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
      process.chdir(targetTestAppPath)
      const packageJsonPath = path.resolve(targetTestAppPath, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

      packageJson.devDependencies['cypress'] = '9.7.0'
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      process.chdir(targetTestAppPath)
      await pexec(`npm install`, {
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

  it('works for diffs with global hooks', async () => {
    const [err, _v] = await presult(runCypress('global-hooks.js', 'helloworldDiffs.js'))
    expect(err.stdout).to.includes('Eyes-Cypress detected diffs')
  })
})
