/* global cy */
describe('checkSettings in global config', () => {
  // This also tests the override of `testName`

  it('make sure checkSettings from global config file is sent to check', () => {
    cy.visit('https://applitools.com/helloworld')
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'checkSettings in global config file',
    })
    cy.eyesCheckWindow('Main Page')
    cy.eyesClose()
  })
  after(() => {
    cy.eyesGetAllTestResults().then(summary => {
      cy.task('log', `Summary results: ${JSON.stringify(summary)}`)
    })
  })
})
