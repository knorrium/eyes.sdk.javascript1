'use strict'
const {describe, it, before, after} = require('mocha')
const {expect} = require('chai')
const path = require('path')
const pexec = require('../util/pexec')
const fs = require('fs')
const {presult} = require('@applitools/functional-commons')

const sourceTestAppPath = path.resolve(__dirname, '../fixtures/testApp')
const targetTestAppPath = path.resolve(
  __dirname,
  '../fixtures/testAppCopies/testApp-global-hooks-overrides-config-file-with-eyes-plugin',
)
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

function updateGlobalHooks(globalHooks) {
  let configContent = fs.readFileSync(path.resolve(targetTestAppPath, `./cypress.config.js`), 'utf-8')
  const content = configContent.replace(/setupNodeEvents\(on, config\) {/g, globalHooks)
  fs.writeFileSync(path.resolve(targetTestAppPath, `./cypress.config.js`), content, 'utf-8')
}

describe('global hooks override in cypress.config.js file using eyes-plugin', () => {
  before(async () => {
    if (fs.existsSync(targetTestAppPath)) {
      fs.rmdirSync(targetTestAppPath, {recursive: true})
    }
    await pexec(`cp -r ${sourceTestAppPath}/. ${targetTestAppPath}`)
    await pexec(`cp ${sourceTestAppPath}Cypress10/cypress.config.js ${targetTestAppPath}/cypress.config.js`)
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
  beforeEach(() => {
    fs.copyFileSync(
      `${__dirname}/../fixtures/cypressConfig-global-hooks-overrides-config-file-with-eyes-plugin.js`,
      `${targetTestAppPath}/cypress.config.js`,
    )
  })

  after(async () => {
    fs.rmdirSync(targetTestAppPath, {recursive: true})
  })

  it('supports running user defined global hooks', async () => {
    await updateConfigFile('index-run.js')
    const globalHooks = `setupNodeEvents(on, config) {
    on('before:run', () => {
      console.log('@@@ before:run @@@');
    });

    on('after:run', () => {
      console.log('@@@ after:run @@@');
    });`
    updateGlobalHooks(globalHooks)
    const [err, output] = await presult(runCypress())
    expect(err).to.be.undefined
    expect(output).to.contain('@@@ before:run @@@')
    expect(output).to.contain('@@@ after:run @@@')
  })

  it('supports running user defined global hooks, when user throws error on before', async () => {
    await updateConfigFile('index-run.js')
    const globalHooks = `setupNodeEvents(on, config) {
    on('before:run', () => {
      throw new Error('@@@ before:run error @@@');
      console.log('@@@ before:run @@@');
    });
    on('after:run', () => {
      console.log('@@@ after:run @@@');
    });`
    updateGlobalHooks(globalHooks)
    const [err] = await presult(runCypress())
    expect(err).not.to.be.undefined
    expect(err.stdout).to.contain('@@@ before:run error @@@')
    expect(err.stdout).not.to.contain('@@@ after:run @@@')
  })

  it('supports running user defined global hooks, when user throws error on after', async () => {
    await updateConfigFile('index-run.js')
    const globalHooks = `setupNodeEvents(on, config) {
    on('before:run', () => {
      console.log('@@@ before:run @@@');
    });
    on('after:run', () => {
      throw new Error('@@@ after:run error @@@');
      console.log('@@@ after:run @@@');
    });`
    updateGlobalHooks(globalHooks)
    const [err] = await presult(runCypress('index-global-hooks-overrides-error-after.js'))
    expect(err).not.to.be.undefined
    expect(err.stdout).to.contain('@@@ before:run @@@')
    expect(err.stdout).to.contain('@@@ after:run error @@@')
  })

  it('supports running user defined global hooks when only 1 hook is defined', async () => {
    await updateConfigFile('index-run.js')
    const globalHooks = `setupNodeEvents(on, config) {
    on('after:run', () => {
      console.log('@@@ after:run @@@');
    });`
    updateGlobalHooks(globalHooks)
    const [err, output] = await presult(runCypress())
    expect(err).to.be.undefined
    expect(output).to.contain('@@@ after:run @@@')
  })
})
