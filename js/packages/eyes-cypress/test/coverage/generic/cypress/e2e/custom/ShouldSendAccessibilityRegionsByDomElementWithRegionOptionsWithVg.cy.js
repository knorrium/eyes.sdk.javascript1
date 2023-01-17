/* global cy,Cypress,expect*/
const {getTestInfo} = require('@applitools/test-utils')

describe('Coverage tests', () => {
  it('should send accessibility regions by DOM element with region options with vg', () => {
    cy.visit('https://applitools.github.io/demo/TestPages/FramesTestPage/')
    cy.eyesOpen({
      appName: 'Eyes Selenium SDK - Fluent API',
      displayName: 'should send accessibility regions by DOM element with region options with vg',
      testName: 'TestAccessibilityRegionsByDomElementWithRegionOptions_VG',
      viewportSize: {width: 700, height: 460},
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
    })
    cy.get('.ignore').then($el => {
      cy.eyesCheckWindow({
        accessibility: $el.toArray().map(element => ({
          accessibilityType: 'LargeText',
          element,
          regionId: 'accessibility-region-id',
          padding: {top: 10},
        })),
      })
    })

    cy.eyesClose()

    cy.eyesGetAllTestResults().then(async summary => {
      const info = await getTestInfo(
        summary.getAllResults()[0].getTestResults(),
        Cypress.config('appliConfFile').apiKey,
      )
      expect(info.actualAppOutput[0].imageMatchSettings.accessibilitySettings).to.eql({
        level: 'AAA',
        version: 'WCAG_2_0',
      })
      expect(info.actualAppOutput[0].imageMatchSettings.accessibility).to.eql([
        {
          isDisabled: false,
          type: 'LargeText',
          left: 10,
          top: 275,
          width: 800,
          height: 511,
          regionId: 'accessibility-region-id (1)',
        },
        {
          isDisabled: false,
          type: 'LargeText',
          left: 122,
          top: 922,
          width: 456,
          height: 317,
          regionId: 'accessibility-region-id (2)',
        },
        {
          isDisabled: false,
          type: 'LargeText',
          left: 8,
          top: 1266,
          width: 690,
          height: 217,
          regionId: 'accessibility-region-id (3)',
        },
      ])
    })
  })
})
