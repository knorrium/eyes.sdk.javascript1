import type {Report, Test, JSONReport, JSONTest} from './types.js'
import {readFile} from 'node:fs/promises'
import {glob} from 'glob'
import humanizer from 'humanize-duration'
import Handlebars from 'handlebars'
import * as path from 'node:path'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as artifact from '@actions/artifact'

main()

async function main() {
  const artifacts = core.getMultilineInput('artifact')

  const results = [] as (Report | {name: string, error: Error})[]
  if (artifacts.length > 0) {
    const client = artifact.create()
    await Promise.all(artifacts.map(async artifact => {
      try {
        const {downloadPath} = await client.downloadArtifact(artifact, './', {createArtifactFolder: true})
        results.push(...await readReports(downloadPath))
      } catch (error: any) {
        results.push({name: artifact, error})
      }
    }))
  } else {
    results.push(...await readReports())
  }

  const {errors, failures, passes} = results.reduce((reports, report) => {
    if ('error' in report) reports.errors.push(report)
    else if (report.failed.length > 0) reports.failures.push(report)
    else reports.passes.push(report)

    return reports
  }, {errors: [] as {name: string, error: Error}[], failures: [] as Report[], passes: [] as Report[]})

  const report = Handlebars.compile(await readFile('./.github/actions/report/templates/report.hbs', {encoding: 'utf8'}));
  const error = Handlebars.compile(await readFile('./.github/actions/report/templates/error.hbs', {encoding: 'utf8'}));
  const layout = Handlebars.compile(await readFile('./.github/actions/report/templates/layout.hbs', {encoding: 'utf8'}));
  const summary = layout({errors, failures, passes}, {
    helpers: {humanizer: (duration: number) => humanizer(duration)},
    partials: {report, error},
  })

  core.summary.addRaw(summary).write()

  const failedArtifacts = errors.length
  core.setOutput('failed-artifacts', failedArtifacts)
  const failedReports = failures.length
  core.setOutput('failed-reports', failedReports)
  const failedTests = failures.reduce((sum, report) => sum + report.failed.length, 0)
  core.setOutput('failed-tests', failedTests)

  const pluralizer = new Intl.PluralRules('en-US')
  if (failedReports > 0 || failedArtifacts > 0) {
    const messages = []
    if (failedArtifacts > 0) {
      messages.push(`${failedArtifacts} missed artifact${pluralizer.select(failedTests) === 'one' ? '' : 's'}`)
    }
    if (failedReports > 0) {
      messages.push(`${failedTests} failed test${pluralizer.select(failedTests) === 'one' ? '' : 's'} in ${failedReports} report${pluralizer.select(failedReports) === 'one' ? '' : 's'}`)
    }
    const message = `Detected ${messages.join(' and ')}`
    core.setOutput('message', message)
    core.setOutput('status', 'failed')
    core.setFailed(message)
  } else {
    const passedReports = passes.length
    const passedTests = passes.reduce((sum, report) => sum + report.passed.length, 0)
    const message = `All ${passedTests} test${pluralizer.select(passedTests) === 'one' ? '' : 's'} passed in ${passedReports} report${pluralizer.select(passedReports) === 'one' ? '' : 's'}`
    core.setOutput('status', 'passed')
    core.setOutput('message', message)
  }
}

async function readReports(workingDir?: string): Promise<Report[]> {
  const paths = await glob(core.getMultilineInput('path'), {cwd: workingDir, absolute: true})
  const reports = await paths.reduce(async (reports, reportPath) => {
    const report = makeReport(JSON.parse(await readFile(reportPath, {encoding: 'utf8'})))
    report.title = path.relative(process.cwd(), reportPath)
    return reports.then(reports => reports.concat(report))
  }, Promise.resolve([] as Report[]))

  return reports
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