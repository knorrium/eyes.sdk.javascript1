/* global cy */
describe('getResults', () => {
  it('First test', () => {
    cy.eyesOpen({
      appName: 'test result',
      testName: 'some test',
    })
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    })
    cy.eyesCheckWindow({
      tag: 'Play Cypress',
    })
    cy.eyesClose()
  })

  it('Second test', () => {
    cy.eyesOpen({
      appName: 'test result 2',
      testName: 'some test 2',
    })
    cy.visit('https://example.org', {
      failOnStatusCode: false,
    })
    cy.eyesCheckWindow({
      tag: 'Play Cypress',
    })
    cy.eyesClose()
    cy.eyesGetResults().then(result => {
      cy.task('logWithTokens', JSON.stringify(result))
    })
  })
})
