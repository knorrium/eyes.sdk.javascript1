const {describe, it} = require('mocha')
const {expect} = require('chai')
const {eyesCheckMapValues} = require('../../../src/browser/eyesCheckMapping')

describe('eyes check mapping', () => {
  const defaultBrowser = {}
  it('should mapp values correctly', () => {
    const args = {
      tag: 'some tag name',
      scriptHooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
      ignore: [{selector: 'some ignore region selector'}],
      layout: [{selector: 'some layout region selector'}],
      strict: [{selector: 'some strict region selector'}],
      content: [{selector: 'some content region selector'}],
      accessibility: [{selector: 'some accessibility region selector', accessibilityType: 'RegularText'}],
      floating: [
        {
          selector: 'some floating region selector',
          maxUpOffset: 3,
          maxDownOffset: 3,
          maxLeftOffset: 20,
          maxRightOffset: 30,
        },
      ],
      userCommandId: 'Login screen variation #1',
      target: 'region',
      selector: {
        type: 'css',
        selector: '.my-element',
      },
      useDom: true,
      enablePatterns: true,
      matchLevel: 'Layout',
      visualGridOptions: {
        polyfillAdoptedStyleSheets: true,
      },
      layoutBreakpoints: [500, 1000],
      waitBeforeCapture: 2000,
      ignoreDisplacements: true,
      fully: false,
    }

    const expected = {
      name: 'some tag name',
      hooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
      ignoreRegions: [{region: 'some ignore region selector'}],
      layoutRegions: [{region: 'some layout region selector'}],
      renderers: undefined,
      strictRegions: [{region: 'some strict region selector'}],
      contentRegions: [{region: 'some content region selector'}],
      accessibilityRegions: [{region: 'some accessibility region selector', type: 'RegularText'}],
      floatingRegions: [
        {
          region: 'some floating region selector',
          offset: {
            top: 3,
            bottom: 3,
            left: 20,
            right: 30,
          },
        },
      ],
      userCommandId: 'Login screen variation #1',
      target: 'region',
      region: {
        selector: '.my-element',
        type: 'css',
      },
      useDom: true,
      enablePatterns: true,
      matchLevel: 'Layout',
      visualGridOptions: {
        polyfillAdoptedStyleSheets: true,
      },
      layoutBreakpoints: [500, 1000],
      waitBeforeCapture: 2000,
      ignoreDisplacements: true,
      fully: false,
    }

    const appliConfFile = {}

    const coreConfig = eyesCheckMapValues({args, appliConfFile, defaultBrowser})
    expect(coreConfig).to.be.deep.equal(expected)
  })
  it('should not include element in the returned config', () => {
    const args = {
      target: 'region',
      element: 'some-element',
    }
    const expected = {
      name: undefined,
      hooks: undefined,
      ignoreRegions: undefined,
      floatingRegions: undefined,
      strictRegions: undefined,
      layoutRegions: undefined,
      contentRegions: undefined,
      accessibilityRegions: undefined,
      region: {'applitools-ref-id': '1234', type: 'element'},
      waitBeforeCapture: undefined,
      renderers: undefined,
      target: 'region',
    }

    const refer = {
      ref: () => {
        return {
          'applitools-ref-id': '1234',
        }
      },
    }

    const coreConfig = eyesCheckMapValues({args, refer, appliConfFile: {}})
    expect(coreConfig).to.be.deep.equal(expected)
  })
  it('should work with string input', () => {
    const args = 'some tag name'
    const expected = {
      name: 'some tag name',
      hooks: undefined,
      ignoreRegions: undefined,
      floatingRegions: undefined,
      strictRegions: undefined,
      layoutRegions: undefined,
      contentRegions: undefined,
      waitBeforeCapture: undefined,
      renderers: undefined,
      accessibilityRegions: undefined,
    }
    const coreConfig = eyesCheckMapValues({args, appliConfFile: {}})
    expect(coreConfig).to.be.deep.equal(expected)
  })

  it('should work with args before appliConfFile file', () => {
    const args = {
      tag: 'some tag name',
      waitBeforeCapture: 3000,
    }

    const expected = {
      renderers: [
        {
          width: 1200,
          height: 1000,
          name: 'chrome',
        },
        {
          width: 800,
          height: 1000,
          name: 'chrome',
        },
      ],
      name: 'some tag name',
      hooks: undefined,
      ignoreRegions: undefined,
      floatingRegions: undefined,
      strictRegions: undefined,
      layoutRegions: undefined,
      contentRegions: undefined,
      waitBeforeCapture: 3000,
      accessibilityRegions: undefined,
    }

    const appliConfFile = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      waitBeforeCapture: 2000,
      showLogs: true,
      dontCloseBatches: false,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
    }
    const coreConfig = eyesCheckMapValues({
      args,
      appliConfFile,
      defaultBrowser,
    })
    expect(coreConfig).to.eql(expected)
  })
  it('should work with config file', () => {
    const args = {
      tag: 'some tag name',
    }

    const expected = {
      renderers: [
        {
          width: 1200,
          height: 1000,
          name: 'chrome',
        },
        {
          width: 800,
          height: 1000,
          name: 'chrome',
        },
      ],
      name: 'some tag name',
      hooks: undefined,
      ignoreRegions: undefined,
      floatingRegions: undefined,
      strictRegions: undefined,
      layoutRegions: undefined,
      contentRegions: undefined,
      waitBeforeCapture: 2000,
      accessibilityRegions: undefined,
    }

    const appliConfFile = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      waitBeforeCapture: 2000,
      showLogs: true,
      dontCloseBatches: false,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
    }
    const coreConfig = eyesCheckMapValues({
      args,
      appliConfFile,
      defaultBrowser,
    })
    expect(coreConfig).to.eql(expected)
  })
})
