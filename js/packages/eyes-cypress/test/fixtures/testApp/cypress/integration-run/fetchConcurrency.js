/* global cy */
describe('Hello world', () => {
  // This also tests the override of `testName`

  it('shows how to use Applitools Eyes with Cypress', () => {
    cy.visit('https://applitools.com/helloworld')
    cy.eyesOpen({
      appName: 'Hello World!',
      testName: 'Fetch concurrency test',
      browser: {width: 800, height: 600},
      // showLogs: true
    })
    cy.eyesCheckWindow('Main Page')
    cy.eyesClose()
    cy.debugHistory().then(history => {
      cy.task('log', JSON.stringify({fetchConcurrency: history.managers[0].fetchConcurrency}))
    })
  })
})
