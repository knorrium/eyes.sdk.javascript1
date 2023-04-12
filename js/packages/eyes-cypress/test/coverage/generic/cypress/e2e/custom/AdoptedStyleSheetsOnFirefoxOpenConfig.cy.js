/* global cy, expect*/

describe('Coverage tests', () => {
  it('adopted styleSheets on firefox from open config', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/AdoptedStyleSheets/index.html')
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'AdoptedStyleSheetsOnFirefoxOpenConfig',
      viewportSize: {width: 700, height: 460},
      baselineEnvName: 'AdoptedStyleSheetsOnFirefoxOpenConfig',
      displayName: 'adopted styleSheets on firefox from open config',
      browser: [{name: 'firefox', width: 640, height: 480}],
      visualGridOptions: {polyfillAdoptedStyleSheets: true},
    })
    cy.eyesCheckWindow()
    cy.eyesClose()
    cy.eyesGetAllTestResults().then(async summary => {
      expect(summary.getAllResults()[0].getException()).to.be.undefined
    })
  })
})
