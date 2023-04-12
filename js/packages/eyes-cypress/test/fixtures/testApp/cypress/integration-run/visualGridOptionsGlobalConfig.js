/* global cy expect*/
describe('works with visualGridOptions from config gile', () => {
  it('test visualGridOptions from config file', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/AdoptedStyleSheets/index.html')
    cy.eyesOpen({
      appName: 'Applitools Eyes SDK',
      testName: 'AdoptedStyleSheetsOnFirefox',
      viewportSize: {width: 700, height: 460},
      baselineEnvName: 'AdoptedStyleSheetsOnFirefox',
      displayName: 'adopted styleSheets on firefox',
      browser: [{name: 'firefox', width: 640, height: 480}],
    })
    cy.eyesCheckWindow()
    cy.eyesClose()
    cy.eyesGetAllTestResults().then(summary => {
      expect(summary.getAllResults()[0].getException()).to.be.undefined
    })
  })
})
