const convert = require('xml-js')

function processXunit(xunit, {metadata, params} = {}) {
  const tests = parseXunitXml(xunit)

  const xmlTests = tests.reduce((acc, test) => {
    const name = parseBareTestName(test._attributes.name)
    acc[name] = {
      ...test._attributes,
      skip: test.hasOwnProperty('skipped') || Number(test._attributes.time) === 0,
      failure: test.hasOwnProperty('failure') || !!test._attributes.failure,
    }
    return acc
  }, {})

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      xmlTests[key] = {...value, skip: !xmlTests[key], ...xmlTests[key], name: value.name}
    })
  }

  return Object.entries(xmlTests).map(([name, test]) => {
    const skip = test.skip || test.skipEmit || false
    return {
      test_name: test.name || name,
      parameters: {...params, variant: test.variant, ...test.params},
      passed: skip ? undefined : !test.failure,
      isGeneric: !!test.isGeneric || !!test.generic,
      isSkipped: skip,
      skipCause: skip ? test.reason : undefined,
    }
  })
}

function parseBareTestName(testCaseName) {
  return testCaseName
    .replace(/Coverage Tests /, '')
    .replace(/\(.*\)/, '')
    .trim()
}

function parseXunitXml(xmlResult) {
  const json = JSON.parse(convert.xml2json(xmlResult, {compact: true, spaces: 2}))
  if (json.hasOwnProperty('testsuites')) {
    const testsuite = json.testsuites.testsuite
    return Array.isArray(testsuite)
      ? testsuite.map(suite => suite.testcase).reduce((flatten, testcase) => flatten.concat(testcase), [])
      : Array.isArray(testsuite.testcase)
      ? testsuite.testcase
      : [testsuite.testcase]
  } else if (json.hasOwnProperty('testsuite')) {
    const testCase = json.testsuite.testcase
    return testCase.hasOwnProperty('_attributes') ? [testCase] : testCase
  } else {
    throw new Error('Unsupported XML format provided')
  }
}

module.exports = {processXunit}
