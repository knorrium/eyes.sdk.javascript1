/* global cy, expect */
describe('remove duplicate tests on retry', () => {
  it('fails and retries', {retries: {runMode: 2}}, () => {
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    })
    if (cy.state('runnable')._currentRetry < 2) {
      cy.document().then(doc => (doc.body.style.background = 'red'))
    }
    cy.eyesOpen({
      appName: 'cypress e2e',
      testName: 'cypress retries',
    })
    cy.eyesCheckWindow({})
    cy.eyesClose().then(() => {
      expect(cy.state('runnable')._currentRetry).to.gte(2)
    })
  })
})
