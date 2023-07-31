const {processXunit} = require('../../src/qa/process-xunit')
const path = require('path')
const fs = require('fs')
const assert = require('assert')

describe('process xunit', () => {
  const fixtureDir = path.resolve(__dirname, '../fixtures')

  it('should throw if parsing an unsupported xml', () => {
    assert.throws(() => {
      processXunit(`<?xml version="1.0" encoding="UTF-8"?>`)
    }, /Unsupported XML format provided/)
  })

  it('should support multiple suites with multiple tests', () => {
    assert.deepStrictEqual(
      processXunit(fs.readFileSync(path.resolve(fixtureDir, 'multiple-suites-multiple-tests.xml'))),
      [
        {
          test_name: 'Coverage Tests TestCheckWindow_VG',
          parameters: {variant: undefined},
          passed: false,
          isGeneric: false,
          isSkipped: false,
          skipCause: undefined,
        },
        {
          test_name: 'Coverage Tests TestCheckWindow',
          parameters: {variant: undefined},
          passed: true,
          isGeneric: false,
          isSkipped: false,
          skipCause: undefined,
        },
        {
          test_name: 'Coverage Tests TestCheckWindow_Scroll',
          parameters: {variant: undefined},
          passed: true,
          isGeneric: false,
          isSkipped: false,
          skipCause: undefined,
        },
      ],
    )
  })

  it('should support multiple suites with multiple tests at every suite', () => {
    assert.deepStrictEqual(
      processXunit(fs.readFileSync(path.resolve(fixtureDir, 'multiple-suites-multiple-tests-each.xml'))),
      [
        {
          isGeneric: false,
          isSkipped: false,
          parameters: {variant: undefined},
          passed: false,
          test_name: 'Coverage Tests TestCheckWindow_VG',
          skipCause: undefined,
        },
        {
          isGeneric: false,
          isSkipped: false,
          parameters: {variant: undefined},
          passed: true,
          test_name: 'Coverage Tests TestCheckWindow',
          skipCause: undefined,
        },
        {
          isGeneric: false,
          isSkipped: false,
          parameters: {variant: undefined},
          passed: true,
          test_name: 'Coverage Tests TestCheckWindow_Scroll',
          skipCause: undefined,
        },
      ],
    )
  })

  it('should support multiple suites with one suite with multiple tests', () => {
    assert.deepStrictEqual(
      processXunit(fs.readFileSync(path.resolve(fixtureDir, 'multiple-suites-multiple-tests-one.xml'))),
      [
        {
          test_name: 'Coverage Tests TestCheckWindow_VG',
          parameters: {variant: undefined},
          passed: false,
          isGeneric: false,
          isSkipped: false,
          skipCause: undefined,
        },
        {
          test_name: 'Coverage Tests TestCheckWindow',
          parameters: {variant: undefined},
          passed: true,
          isGeneric: false,
          isSkipped: false,
          skipCause: undefined,
        },
      ],
    )
  })

  it('should support multiple suites with a single test', () => {
    assert.deepStrictEqual(processXunit(fs.readFileSync(path.resolve(fixtureDir, 'multiple-suites-single-test.xml'))), [
      {
        test_name: 'Coverage Tests TestCheckRegionWithIgnoreRegion_Fluent_Scroll',
        parameters: {variant: undefined},
        passed: true,
        isGeneric: false,
        isSkipped: false,
        skipCause: undefined,
      },
    ])
  })

  it('should support a single suite with a single test', () => {
    assert.deepStrictEqual(processXunit(fs.readFileSync(path.resolve(fixtureDir, 'single-suite-single-test.xml'))), [
      {
        test_name:
          'TestCheckWindow_Fluent (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots/.applitools-abe4123e-d970-44da-8c3c-220fb9b47640/screenshot.png)',
        parameters: {variant: undefined},
        passed: true,
        isGeneric: false,
        isSkipped: false,
        skipCause: undefined,
      },
    ])
  })

  it('should support a single suite with multiple tests', () => {
    assert.deepStrictEqual(processXunit(fs.readFileSync(path.resolve(fixtureDir, 'single-suite-multiple-tests.xml'))), [
      {
        test_name:
          'TestCheckPageWithHeader_Window_Fully_Scroll (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots)',
        parameters: {variant: undefined},
        passed: true,
        isGeneric: false,
        isSkipped: false,
        skipCause: undefined,
      },
      {
        test_name:
          'TestCheckPageWithHeader_Window_Fully (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots)',
        parameters: {variant: undefined},
        passed: true,
        isGeneric: false,
        isSkipped: false,
        skipCause: undefined,
      },
      {
        test_name:
          'TestCheckWindow_Fluent_Scroll (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots/.applitools-d78b8a0c-95d0-4820-a5f0-b86b464d22cd/screenshot.png)',
        parameters: {variant: undefined},
        passed: true,
        isGeneric: false,
        isSkipped: false,
        skipCause: undefined,
      },
      {
        test_name:
          'TestCheckWindow_Fluent (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots/.applitools-70dea208-3333-4f0a-b7e8-0b1fb3e40a43/screenshot.png)',
        parameters: {variant: undefined},
        passed: true,
        isGeneric: false,
        isSkipped: false,
        skipCause: undefined,
      },
    ])
  })

  it('should handle skipped test with <skipped /> tag', () => {
    assert.deepStrictEqual(processXunit(fs.readFileSync(path.resolve(fixtureDir, 'single-suite-skipped-test.xml'))), [
      {
        test_name:
          'TestCheckWindow_Fluent (screenshots: /Users/tourdedave/_dev/applitools/eyes.sdk.javascript1/packages/eyes-testcafe/screenshots/.applitools-abe4123e-d970-44da-8c3c-220fb9b47640/screenshot.png)',
        parameters: {variant: undefined},
        passed: undefined,
        isGeneric: false,
        isSkipped: true,
        skipCause: undefined,
      },
    ])
  })
})
