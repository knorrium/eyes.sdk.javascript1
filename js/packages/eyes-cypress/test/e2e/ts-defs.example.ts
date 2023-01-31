// eslint-disable-next-line
/// <reference path="../../types/index.d.ts" />

cy.eyesOpen()

// VGC options
cy.eyesOpen({appName: 'someName'})

// string
cy.eyesCheckWindow('just string')

// VGC options
cy.eyesCheckWindow({
  tag: 'Play Cypress',
})

cy.eyesClose()
