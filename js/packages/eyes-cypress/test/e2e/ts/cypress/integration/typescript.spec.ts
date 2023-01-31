const testName = 'Cypress typescript test'

describe(testName, () => {
  beforeEach(() => {
    const url = 'https://applitools.com/helloworld'
    cy.visit(url)
  })

  it('basic with test results', () => {
    cy.eyesOpen({
      appName: 'Cypress typescript App',
      testName,
    })
    cy.eyesCheckWindow({
      target: 'window',
      fully: true,
      waitBeforeCapture: 1000,
    })
    cy.eyesClose()
  })

  after(() => {
    cy.eyesGetAllTestResults().then(summary => {
      const testResults = summary.getAllResults()[0]
      expect(summary.getAllResults()).to.have.length(1)
      expect(testResults.getException()).to.be.undefined
      expect(testResults.getBrowserInfo()).to.have.property('width')
      expect(testResults.getBrowserInfo()).to.have.property('height')
      expect(testResults.getTestResults()).to.have.property('name', testName)
      expect(testResults.getTestResults()).to.have.property('status', 'Passed')
    })
  })
})
