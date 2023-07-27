const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const fetch = require('node-fetch')
const {processXunit} = require('./process-xunit')
const {processMocha} = require('./process-mocha')

const processReport = {
  xunit: processXunit,
  mocha: processMocha,
}

async function sendTestReport({reportId, name, group, params, metaPath, resultPath, resultFormat, sandbox = false}) {
  if (!resultPath) resultPath = './coverage-test-report.xml'
  if (!metaPath) metaPath = './coverage-tests-metadata.json'
  if (!resultFormat) {
    resultFormat = resultPath.endsWith('.xml') ? 'xunit' : 'mocha'
  }

  let metadata
  try {
    metadata = require(path.resolve(metaPath))
  } catch (error) {
    console.log(chalk.red('No metadata file found'))
  }

  const file = fs.readFileSync(path.resolve(resultPath), {encoding: 'utf-8'})

  const report =
    resultFormat === 'raw'
      ? {...JSON.parse(file), id: reportId}
      : {
          id: reportId,
          sdk: name,
          group: group || 'selenium',
          results: processReport[resultFormat](file, {metadata, params}),
          sandbox,
        }

  console.log('Report was successfully generated!\n')
  if (report.id) console.log(`${chalk.bold('Report ID')}: ${report.id}\n`)

  const total = report.results.length
  const {passed, failed, skipped, generic, custom} = report.results.reduce(
    (counts, result) => {
      if (result.isGeneric) counts.generic += 1
      else counts.custom += 1

      if (result.isSkipped) counts.skipped += 1
      else if (result.passed) counts.passed += 1
      else counts.failed += 1

      return counts
    },
    {passed: 0, failed: 0, skipped: 0, generic: 0, custom: 0},
  )

  console.log(
    `${chalk.bold(`${total}`.padEnd(3))} total including ${chalk.blue.bold(
      `${generic} generic`,
    )} and ${chalk.magenta.bold(`${custom} custom`)} test(s)`,
  )
  console.log(chalk.green(`${chalk.bold(`${passed}`.padEnd(3))} passed test(s)`))
  console.log(chalk.cyan(`${chalk.bold(`${skipped}`.padEnd(3))} skipped test(s)`))
  console.log(chalk.red(`${chalk.bold(`${failed}`.padEnd(3))} failed test(s)`))

  process.stdout.write(`\nSending report to QA dashboard ${sandbox ? '(sandbox)' : ''}... `)
  const response = await fetch('http://applitools-quality-server.herokuapp.com/result', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(report),
  })

  if (response.status !== 200) {
    console.error(await response.text())
    throw new Error(`Request failed with status ${response.status}`)
  }
}

module.exports = {sendTestReport}
