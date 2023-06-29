/* global cy */
describe('checkSettings in global config', () => {
  it('make sure checkSettings from open is sent to check', () => {
    cy.visit('https://applitools.com/helloworld')
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'checkSettings in open config',
      batchName: 'CheckSettings with open config',
      batchSequenceName: 'CheckSettings - open config',
      notifyOnCompletion: true,
      browser: {height: 500, width: 500, name: 'firefox'},
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      layoutBreakpoints: true,
      sendDom: true,
      useDom: true,
      enablePatterns: true,
      matchLevel: 'layout',
    })
    cy.eyesCheckWindow('Main Page')
    cy.eyesClose()
  })
  after(() => {
    cy.eyesGetAllTestResults().then(summary => {
      cy.task('logWithTokens', `Summary results: ${JSON.stringify(summary)}`)
    })
  })
})
