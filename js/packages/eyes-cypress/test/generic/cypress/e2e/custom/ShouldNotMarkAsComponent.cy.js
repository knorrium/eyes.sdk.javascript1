const {getTestInfo} = require('@applitools/test-utils')

describe('Coverage tests', () => {
  /* global cy*/
  it('Should send isComponentAgent false', () => {
    cy.visit('https://applitools.com/helloworld')
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'Should send isComponentAgent false',
      browser: [{name: 'chrome', width: 1000, height: 800}],
    })
    cy.eyesCheckWindow({isFully: false, fully: false})
    cy.eyesClose(undefined)
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      )
      assert.equal(info.startInfo.isComponentAgent, false)
    })
  })
})
