'use strict'
const {describe, it, before, after} = require('mocha')
const {expect} = require('chai')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(__dirname, '../fixtures/testAppCopies/testApp-global-hooks-overrides')
const cwd = process.cwd()

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

describe('global hooks override', () => {
  beforeEach(async () => {
    await pexec(`cp ${sourceTestAppPath}Cypress10/cypress.config.js ${targetTestAppPath}`)
  })

  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
    fs.unlinkSync(`${targetTestAppPath}/cypress.json`)
    const packageJsonPath = path.resolve(targetTestAppPath, 'package.json')

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))
    process.chdir(cwd)
    const latestCypressVersion = (await pexec('npm view cypress version')).stdout.trim()

    packageJson.devDependencies['cypress'] = latestCypressVersion
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    process.chdir(targetTestAppPath)
    await pexec(`yarn`, {
      maxBuffer: 1000000,
    })
  })

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true})
  })

  it('supports running *sync* user defined global hooks', async () => {
    await updateConfigFile('index-global-hooks-overrides-sync.js')
    const [err, output] = await presult(runCypress())
    expect(err).to.be.undefined
    expect(output).to.contain('@@@ before:run @@@')
    expect(output).to.contain('@@@ after:run @@@')
  })

  it('supports running *async* user defined global hooks', async () => {
    await updateConfigFile('index-global-hooks-overrides-async.js')
    const [err, output] = await presult(runCypress())
    expect(err).to.be.undefined
    expect(output).to.contain('@@@ before:run @@@')
    expect(output).to.contain('@@@ after:run @@@')
  })

  it('supports running user defined global hooks, when user throws error on before', async () => {
    await updateConfigFile('index-global-hooks-overrides-error-before.js')
    const [err] = await presult(runCypress())
    expect(err).not.to.be.undefined
    expect(err.stdout).to.contain('@@@ before:run error @@@')
    expect(err.stdout).not.to.contain('@@@ after:run @@@')
  })

  it('supports running user defined global hooks, when user throws error on after', async () => {
    await updateConfigFile('index-global-hooks-overrides-error-after.js')
    const [err] = await presult(runCypress('index-global-hooks-overrides-error-after.js'))
    expect(err).not.to.be.undefined
    expect(err.stdout).to.contain('@@@ before:run @@@')
    expect(err.stdout).to.contain('@@@ after:run error @@@')
  })

  it('supports running user defined global hooks when only 1 hook is defined', async () => {
    await updateConfigFile('index-global-hooks-overrides-only-after.js', 'helloworld.js')
    const [err, output] = await presult(runCypress())
    expect(err).to.be.undefined
    expect(output).to.contain('@@@ after:run @@@')
  })
})
