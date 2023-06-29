/* global cy */
describe('getResult with diffs', () => {
  it('Test with diffs and throwErr not set', function () {
    cy.eyesOpen({
      appName: 'test with diffs',
      testName: 'should fail',
    })
    cy.visit('https://applitools.com/helloworld/?diff1')

    cy.eyesCheckWindow()
    cy.eyesClose()
    cy.eyesGetResults()
  })

  it('Test with diffs and throwErr set to false', function () {
    cy.eyesOpen({
      appName: 'test with diffs',
      testName: 'should not fail',
    })
    cy.visit('https://applitools.com/helloworld/?diff1')

    cy.eyesCheckWindow()
    cy.eyesClose()
    cy.eyesGetResults({throwErr: false})
  })
})
