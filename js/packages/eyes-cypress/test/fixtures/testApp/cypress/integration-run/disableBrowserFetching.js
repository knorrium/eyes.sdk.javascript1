/* global cy */
describe('disableBrowserFetching', () => {
  it('should get a the original green background without the cy.intercept', () => {
    cy.intercept('GET', 'body-green.css', 'body {background-color: red;}');
    cy.setCookie('auth', 'secret');
    const url = `http://localhost:${Cypress.config('testPort')}/empty-with-css.html`;
    cy.visit(url);
    cy.eyesOpen({
      appName: 'some app',
      browser: {width: 100, height: 100},
    });
    cy.eyesCheckWindow('full page');
    cy.eyesClose();
  });
});
