import type {PrimarySpecType} from '../../src/spec-driver'
import {transformConfig, transformCheckSettings} from '../../src/legacy'
import * as assert from 'assert'

describe('translate check args to check settings', () => {
  it('tag', () => {
    const checkSettings = transformCheckSettings({tag: 'blah'})
    assert.deepStrictEqual(checkSettings.name, 'blah')
  })
  it('window fully', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({target: 'window' as const, fully: true})
    assert.deepStrictEqual(checkSettings.fully, true)
  })
  it('region selector', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      target: 'region' as const,
      selector: '#overflowing-div',
    })
    assert.deepStrictEqual(checkSettings.region, '#overflowing-div')
  })
  it('region', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      target: 'region' as const,
      region: {top: 100, left: 0, width: 1000, height: 200},
    })
    assert.deepStrictEqual(checkSettings.region, {top: 100, left: 0, width: 1000, height: 200})
  })
  it('ignore', async () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      ignore: [{selector: '#overflowing-div'}, {top: 100, left: 0, width: 1000, height: 200}],
    })
    assert.deepStrictEqual(checkSettings.ignoreRegions!.length, 2)
    assert.deepStrictEqual(checkSettings.ignoreRegions![0], '#overflowing-div')
    assert.deepStrictEqual(checkSettings.ignoreRegions![1], {top: 100, left: 0, width: 1000, height: 200})
  })
  it('floating', async () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      floating: [
        {
          top: 100,
          left: 0,
          width: 1000,
          height: 100,
          maxUpOffset: 20,
          maxDownOffset: 20,
          maxLeftOffset: 20,
          maxRightOffset: 20,
        },
        {selector: '#overflowing-div', maxUpOffset: 20, maxDownOffset: 20, maxLeftOffset: 20, maxRightOffset: 20},
      ],
    })
    assert.deepStrictEqual(checkSettings.floatingRegions!.length, 2)
    assert.deepStrictEqual(checkSettings.floatingRegions![0], {
      region: {top: 100, left: 0, width: 1000, height: 100},
      maxUpOffset: 20,
      maxDownOffset: 20,
      maxLeftOffset: 20,
      maxRightOffset: 20,
    })
    assert.deepStrictEqual(checkSettings.floatingRegions![1], {
      region: '#overflowing-div',
      maxUpOffset: 20,
      maxDownOffset: 20,
      maxLeftOffset: 20,
      maxRightOffset: 20,
    })
  })
  it('layout', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      layout: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
    })
    assert.deepStrictEqual(checkSettings.layoutRegions!.length, 2)
  })
  it('strict', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      strict: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
    })
    assert.deepStrictEqual(checkSettings.strictRegions!.length, 2)
  })
  it('content', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      content: [{top: 100, left: 0, width: 1000, height: 100}, {selector: '#overflowing-div'}],
    })
    assert.deepStrictEqual(checkSettings.contentRegions!.length, 2)
  })
  it('accessibility', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      accessibility: [
        {accessibilityType: 'RegularText', selector: '#overflowing-div'},
        {accessibilityType: 'BoldText', top: 100, left: 0, width: 1000, height: 100},
      ],
    })
    assert.deepStrictEqual(checkSettings.accessibilityRegions!.length, 2)
  })
  it('scriptsHooks', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({
      scriptHooks: {
        beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
      },
    })
    assert.deepStrictEqual(checkSettings.hooks, {
      beforeCaptureScreenshot: "document.body.style.backgroundColor = 'gold'",
    })
  })
  it('sendDom', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({sendDom: false})
    assert.deepStrictEqual(checkSettings.sendDom, false)
  })
  it('enablePatterns', () => {
    const checkSettings = transformCheckSettings<PrimarySpecType>({enablePatterns: true})
    assert.deepStrictEqual(checkSettings.enablePatterns, true)
  })
})

describe('translate open args to config', () => {
  it('works', () => {
    const config = transformConfig<PrimarySpecType>({
      testName: 'test-name',
      browser: [{width: 1024, height: 768, name: 'ie'}],
      batchId: 'batch-id',
      batchName: 'batch-name',
      baselineEnvName: 'baseline-env-name',
      envName: 'env-name',
      ignoreCaret: true,
      baselineBranchName: 'baseline-branch-name',
      saveFailedTests: true,
      saveNewTests: true,
      matchLevel: 'None',
      properties: [{name: 'My prop', value: 'My value'}],
      ignoreDisplacements: true,
      compareWithParentBranch: true,
      ignoreBaseline: true,
      notifyOnCompletion: true,
      accessibilityValidation: {level: 'AA', guidelinesVersion: 'WCAG_2_0'},
      showLogs: true,
    })
    assert.deepStrictEqual(config, {
      testName: 'test-name',
      browsersInfo: [{width: 1024, height: 768, name: 'ie'}],
      batch: {
        id: 'batch-id',
        name: 'batch-name',
        notifyOnCompletion: true,
      },
      baselineEnvName: 'baseline-env-name',
      environmentName: 'env-name',
      baselineBranchName: 'baseline-branch-name',
      saveFailedTests: true,
      saveNewTests: true,
      properties: [{name: 'My prop', value: 'My value'}],
      compareWithParentBranch: true,
      ignoreBaseline: true,
      showLogs: true,
      defaultMatchSettings: {
        ignoreCaret: true,
        accessibilitySettings: {level: 'AA', guidelinesVersion: 'WCAG_2_0'},
        ignoreDisplacements: true,
        matchLevel: 'None',
      },
    })
  })
  it('skips undefined entries', () => {
    const config = transformConfig<PrimarySpecType>({})
    assert.deepStrictEqual(config, {})
  })
})

describe('translate applitools.config.js file contents to config', () => {
  it('works', () => {
    const config = transformConfig<PrimarySpecType>({
      apiKey: 'asdf',
      serverUrl: 'https://blah',
      proxy: 'https://username:password@myproxy.com:443',
      isDisabled: true,
      failTestcafeOnDiff: false,
      tapDirPath: process.cwd(),
      dontCloseBatches: true,
      disableBrowserFetching: true,
      showLogs: true,
    })
    assert.deepStrictEqual(config, {
      apiKey: 'asdf',
      showLogs: true,
      serverUrl: 'https://blah',
      proxy: {url: 'https://username:password@myproxy.com:443'},
      isDisabled: true,
      failTestcafeOnDiff: false,
      tapDirPath: process.cwd(),
      dontCloseBatches: true,
      disableBrowserFetching: true,
    })
  })
})
