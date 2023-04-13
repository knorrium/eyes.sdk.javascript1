/* global cy */
it('should support js layouts from config file', () => {
  cy.visit('https://applitools.github.io/demo/TestPages/JsLayout/')
  cy.eyesOpen({
    appName: 'JS layout',
    testName: 'should support js layouts from config file',
    browser: [
      {width: 1000, height: 800},
      {iosDeviceInfo: {deviceName: 'iPad (7th generation)'}},
      {chromeEmulationInfo: {deviceName: 'Pixel 4 XL'}},
    ],
    waitBeforeCapture: 500,
  })
  cy.eyesCheckWindow('layoutBreakpoints in eyesOpen')
  cy.eyesClose()
})
