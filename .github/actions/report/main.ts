import type {JSONReport} from './types.js'
import {readFile} from 'node:fs/promises'
import {glob} from 'glob'
import ms from 'ms'
import Handlebars from 'handlebars'
import * as core from '@actions/core'

async function main() {
  const paths = await glob(core.getMultilineInput('path'), {absolute: true})

  const reports = await paths.reduce(async (reports, path) => {
    try {
      const content = await readFile(path, {encoding: 'utf8'})
      const report = JSON.parse(content)
      
      return reports.then(reports => [...reports, report])
    } catch {
      return reports
    }
  }, Promise.resolve([] as JSONReport[]))

  let report: JSONReport | undefined
  if (reports.length > 0) {
    report = reports.reduce((mergedReport, report) => {
      mergedReport.stats.suites += report.stats.suites
      mergedReport.stats.tests += report.stats.tests
      mergedReport.stats.passes += report.stats.passes
      mergedReport.stats.pending += report.stats.pending
      mergedReport.stats.failures += report.stats.failures
      mergedReport.stats.duration += report.stats.duration
      mergedReport.passes.push(...report.passes)
      mergedReport.pending.push(...report.pending)
      mergedReport.failures.push(...report.failures)
      return mergedReport
    })
  }

  const template = Handlebars.compile(await readFile('./.github/actions/report/summary.hbs', {encoding: 'utf8'}));
  const summary = template(report, {
    helpers: {ms: (duration: number) => ms(duration, {long: true})}
  })

  core.summary.addRaw(summary).write()
}

main()
