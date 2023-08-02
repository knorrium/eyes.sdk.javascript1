import Button from './Button';
const {getTestInfo} = require('@applitools/test-utils')

describe('Button', () => {
  it('should mount', () => {
    cy.mount(<Button>Click Me</Button>);
    cy.get('button').contains('Click Me');
    cy.eyesOpen({
      appName: 'reactApp',
      testName: 'button'
    })
    cy.eyesCheckWindow('button')
    cy.eyesClose()
    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      )
     assert.equal(info.startInfo.isComponentAgent, true)
    })
  });
});
