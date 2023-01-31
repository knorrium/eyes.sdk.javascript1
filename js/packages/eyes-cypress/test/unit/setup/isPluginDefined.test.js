'use strict'

const {describe, it} = require('mocha')
const {expect} = require('chai')
const isPluginDefined = require('../../../src/setup/isPluginDefined')
const isPluginDefinedESM = require('../../../src/setup/isPluginDefinedESM')

describe('isPluginDefinedESM', () => {
  it('handles multiline without plugin import', () => {
    const text = `
    import { defineConfig } from 'cypress'
    export default defineConfig({
      e2e: {
        setupNodeEvents(on, config) {
        }
      },
    })
    `
    expect(isPluginDefined(text)).to.equal(false)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })

  it.skip('handles multiline with plugin import but not assign', () => {
    const text = `
    import { defineConfig } from 'cypress'
    import eyes from '@applitools/eyes-cypress'
    export default defineConfig({
      e2e: {
        setupNodeEvents(on, config) {
        }
      },
    })
    `
    expect(isPluginDefined(text)).to.equal(false)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })

  it('handles multiline with plugin import and assign', () => {
    const text = `
    import { defineConfig } from 'cypress'
    import eyes from '@applitools/eyes-cypress'
    export default eyes(defineConfig({
      e2e: {
        setupNodeEvents(on, config) {
        }
      },
    }))
    `
    expect(isPluginDefined(text)).to.equal(false)
    expect(isPluginDefinedESM(text)).to.equal(true)
  })
})
describe('isPluginDefined', () => {
  it('handles single quote require', () => {
    const text = "require('@applitools/eyes-cypress');"
    expect(isPluginDefined(text)).to.equal(true)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })

  it('handles double quote require', () => {
    const text = 'require("@applitools/eyes-cypress");'
    expect(isPluginDefined(text)).to.equal(true)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })

  it('handles require with spaces', () => {
    const text = 'require ( "@applitools/eyes-cypress" ) ;'
    expect(isPluginDefined(text)).to.equal(true)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })

  it('handles multiline with require', () => {
    const text = `
    'use strict';

    require('@applitools/eyes-cypress');

    module.exports = (on, config) => {
      return config;
    }
    
    `

    expect(isPluginDefined(text)).to.equal(true)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })

  it('handles wrong inner require', () => {
    const text = 'require("@applitools/eyes-cypress/bla");'
    expect(isPluginDefined(text)).to.equal(false)
    expect(isPluginDefinedESM(text)).to.equal(false)
  })
})
