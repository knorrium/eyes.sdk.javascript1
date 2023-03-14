import type {Report, Test, JSONReport, JSONTest} from './types.js'
import {readFile} from 'node:fs/promises'
import {glob} from 'glob'
import humanizer from 'humanize-duration'
import Handlebars from 'handlebars'
import * as path from 'node:path'
import * as core from '@actions/core'
import * as github from '@actions/github'

main()

async function main() {
  const paths = await glob(core.getMultilineInput('path'), {absolute: true})

  const reports = await paths.reduce(async (reports, reportPath) => {
    const report = makeReport(JSON.parse(await readFile(reportPath, {encoding: 'utf8'})))
    report.title = path.relative(process.cwd(), reportPath)
    return reports.then(reports => {
      if (report.failed.length > 0) reports.failures.push(report)
      else reports.passes.push(report)
      return reports
    })
  }, Promise.resolve({failures: [] as Report[], passes: [] as Report[]}))

  const report = Handlebars.compile(await readFile('./.github/actions/report/templates/report.hbs', {encoding: 'utf8'}));
  const layout = Handlebars.compile(await readFile('./.github/actions/report/templates/layout.hbs', {encoding: 'utf8'}));
  const summary = layout({reports}, {
    helpers: {humanizer: (duration: number) => humanizer(duration)},
    partials: {report},
  })

  core.summary.addRaw(summary).write()

  const failedReports = reports.failures.length
  const failedTests = reports.failures.reduce((sum, report) => sum + report.failed.length, 0)
  core.setOutput('failed-reports', failedReports)
  core.setOutput('failed-tests', failedTests)

  const pluralizer = new Intl.PluralRules('en-US')
  if (failedReports > 0) {
    const message = `Detected ${failedTests} failed test${pluralizer.select(failedTests) === 'one' ? '' : 's'} in ${failedReports} report${pluralizer.select(failedReports) === 'one' ? '' : 's'}`
    core.setOutput('message', message)
    core.setFailed(message)
  } else {
    const passedReports = reports.passes.length
    const passedTests = reports.passes.reduce((sum, report) => sum + report.failed.length, 0)
    const message = `All ${passedTests} tests${pluralizer.select(passedTests) === 'one' ? '' : 's'} passed in ${passedReports} report${pluralizer.select(passedReports) === 'one' ? '' : 's'}`
    core.setOutput('message', message)
  }
}

function makeReport(jsonReport: JSONReport): Report {
  return {
    duration: jsonReport.stats.duration,
    failed: jsonReport.failures.map(makeTest),
    skipped: jsonReport.pending.map(makeTest),
    passed: jsonReport.passes.map(makeTest),
  }

  function makeTest(jsonTest: JSONTest): Test {
    const relativePath = path.relative(process.cwd(), jsonTest.file)
    return {
      title: jsonTest.fullTitle,
      url: new URL(relativePath, `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/blob/${github.context.ref.split('/').slice(2).join('/') ?? 'master'}/`).href,
      path: relativePath,
      duration: jsonTest.duration,
      error: jsonTest.err
    }
  }
}