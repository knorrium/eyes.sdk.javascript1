import type {Lang, Job, Package} from './types.js'
import {execSync} from 'node:child_process'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import * as core from '@actions/core'
import * as ini from 'ini'
import * as xml from 'xml-js'

enum Runner {
  linux = 'ubuntu-latest',
  ubuntu = 'ubuntu-latest',
  linuxarm = 'buildjet-2vcpu-ubuntu-2204-arm',
  ubuntuarm = 'buildjet-2vcpu-ubuntu-2204-arm',
  macos = 'macos-latest',
  mac = 'macos-latest',
  windows = 'windows-2022',
  win = 'windows-2022',
}

main()
  .catch(err => {
    console.error(err)
    core.setFailed(err.message)
  })

async function main() {
  core.debug(`current base ref - ${process.env.GITHUB_BASE_REF}`)
  const sha = await getSha()
  core.debug(`current sha - ${sha}`)
  const packages = await makePackages()

  const envs = core.getInput('env').split(/[;\s]+/).reduce((envs, env) => {
    const [key, value] = env.split('=')
    return {...envs, [key]: value}
  }, {})


  const type = core.getInput('type')
  const ci = type.startsWith('ci')
  const release = type === 'release'
  const environment = ['ci-prod', 'release'].includes(type) ? 'prod' : 'dev'

  let jobs: {builds: Record<Lang, Job[]>, tests: Record<Lang, Job[]>, releases: Record<Lang, Job[]>}
  if (ci) {
    const names = getChangedPackageNames()
    core.notice(`Changed packages: "${names.join(' ')}"`)
    jobs = makeJobs(names)
  } else if (release) {
    const tags = core.getMultilineInput('tag').flatMap(tag => tag.split(/[\s\n,]+/))
    const names = getPackageNamesFromTags(tags)
    core.notice(`Release packages: "${names.join(' ')}"`)
    jobs = makeJobs(names)
  } else {
    const input = core.getInput('packages')
    core.notice(`Requested packages: "${input}"`)
    jobs = {} as any
  }

  core.debug(JSON.stringify(jobs, null, 2))

  if (jobs.builds && Object.values(jobs.builds).flat().length > 0) {
    core.info(`Build jobs: "${Object.values(jobs.builds).flat().map(job => job['display-name']).join(', ')}"`)
    core.setOutput('builds', jobs.builds)
  }
  if (jobs.tests && Object.values(jobs.tests).flat().length > 0) {
    core.info(`Test jobs: "${Object.values(jobs.tests).flat().map(job => job['display-name']).join(', ')}"`)
    core.setOutput('tests', jobs.tests)
  }
  if (jobs.releases && Object.values(jobs.releases).flat().length > 0) {
    core.info(`Release jobs: "${Object.values(jobs.releases).flat().map(job => job['display-name']).join(', ')}"`)
    core.setOutput('releases', jobs.releases)
  }

  async function makePackages(): Promise<Package[]> {
    const releaseConfigPath = path.resolve(process.cwd(), './release-please-config.json')
    const releaseConfig = JSON.parse(await fs.readFile(releaseConfigPath, {encoding: 'utf8'})) as {packages: Record<string, any>}
    return Object.entries(releaseConfig.packages).reduce(async (promise, [packagePath, packageConfig], index) => {
      if (packageConfig.component.startsWith('js/')) {
        const packageManifestPath = path.resolve(packagePath, 'package.json')
        const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
        return promise.then(packages => packages.concat({
          index,
          lang: 'js',
          name: manifest.name,
          version: manifest.version,
          component: packageConfig.component,
          path: packagePath,
          tests: packageConfig.tests ?? [],
          builds: packageConfig.builds ?? [],
          releases: packageConfig.releases ?? [],
        }))
      }
      if (packageConfig.component.startsWith('java/')) {
        const packageManifestPath = path.resolve(packagePath, 'pom.xml')
        const manifest = xml.xml2js(await fs.readFile(packageManifestPath, 'utf-8'), { compact: true }) as xml.ElementCompact
        return promise.then(packages => packages.concat({
          index,
          lang: 'java',
          name: manifest.project.name._text,
          version: manifest.project.version._text,
          component: packageConfig.component,
          path: packagePath,
          tests: packageConfig.tests ?? [],
          builds: packageConfig.builds ?? [],
          releases: packageConfig.releases ?? [],
        }))
      }
      if (packageConfig.component.startsWith('python/')) {
        const packageManifestPath = path.resolve(packagePath, 'setup.cfg')
        const manifest = ini.parse(await fs.readFile(packageManifestPath, 'utf-8'))
        return promise.then(packages => packages.concat({
          index,
          lang: 'python',
          name: manifest.metadata.name,
          version: manifest.metadata.version,
          component: packageConfig.component,
          path: packagePath,
          tests: packageConfig.tests ?? [],
          builds: packageConfig.builds ?? [],
          releases: packageConfig.releases ?? [],
        }))
      }
      return promise
    }, Promise.resolve([] as Package[]))
  }

  function makeJobs(names: string[]): {builds: Record<Lang, Job[]>, tests: Record<Lang, Job[]>, releases: Record<Lang, Job[]>} {
    // Make all possible jobs grouped by type and lang
    const jobs = packages.reduce((jobs, pkg) => {
      const packageJob = {
        name: pkg.component,
        lang: pkg.lang,
        'short-name': pkg.component.replace(/^.+?\//, ''),
        'display-name': pkg.component,
        'package-name': pkg.name,
        'package-index': pkg.index,
        'package-version': pkg.version,
        'working-directory': pkg.path,
      }

      pkg.builds.forEach(extension => {
        jobs.build.push(makeJob(packageJob, {type: 'build', extension}))
      })

      if (ci) {
        pkg.tests.forEach(extension => {
          if (pkg.builds.length > 0) extension['build-type'] ??= 'none'
          jobs.main.push(makeJob(packageJob, {type: 'test', extension}))
        })
      } else if (release) {
        pkg.releases.forEach(extension => {
          jobs.main.push(makeJob(packageJob, {type: 'release', extension}))
        })
      }

      return jobs
    }, {build: [] as Job[], main: [] as Job[]})

    // Selecting only relevant jobs from main jobs group
    const mainJobs = sortJobs(
      prepareMainJobs(jobs, mainJob => names.includes(mainJob.name))
    )
    const buildJobs = sortJobs(
      prepareBuildJobs(
        jobs,
        buildJob => names.includes(buildJob.name) || mainJobs.some(mainJob => mainJob.builds?.includes(buildJob.key!)),
        environment === 'dev'
      )
    )

    const artifacts = buildJobs.reduce((artifacts, job) => {
      if (job.key && job.artifacts) artifacts[job.key] = job.artifacts
      return artifacts
    }, {} as Record<string, string[]>)

    mainJobs.forEach(mainJob => {
      mainJob.builds &&= mainJob.builds.flatMap(key => artifacts[key] ? `${key}$${artifacts[key].join(';')}` : [])
    })
    buildJobs.forEach(buildJob => {
      buildJob.builds &&= buildJob.builds.flatMap(key => artifacts[key] ? `${key}$${artifacts[key].join(';')}` : [])
    })

    const result = {} as {builds: Record<Lang, Job[]>} & Record<'tests' | 'releases', Record<Lang, Job[]>>
    result.builds = buildJobs.reduce((buildJobs, buildJob) => {
      buildJobs[buildJob.lang] ??= []
      buildJobs[buildJob.lang].push(buildJob)
      return buildJobs
    }, {} as Record<Lang, Job[]>)
    result[release ? 'releases' : 'tests'] =  mainJobs.reduce((mainJobs, mainJob) => {
      mainJobs[mainJob.lang] ??= []
      mainJobs[mainJob.lang].push(mainJob)
      return mainJobs
    }, {} as Record<Lang, Job[]>)

    return result

    function prepareMainJobs(jobs: {main: Job[], build: Job[]}, filter: (job: Job) => boolean) {
      return jobs.main.reduce((selectedJobs, mainJob) => {
        if (filter(mainJob)) {
          const selectedJob = {...mainJob}
          selectedJob.builds = selectedJob.builds
            ? selectedJob.builds.filter(key => jobs.build.some(buildJob => buildJob.key === key))
            : jobs.build.reduce((keys, buildJob) => {
              return buildJob.key && buildJob.name === selectedJob.name ? keys.concat(buildJob.key) : keys
            }, [] as string[])
          selectedJobs.push(selectedJob)
        }
        return selectedJobs
      }, [] as Job[])
    }

    function prepareBuildJobs(jobs: {build: Job[]}, filter: (job: Job) => boolean, recursive?: boolean) {
      return jobs.build.reduce((selectedJobs, buildJob) => {
        if (filter(buildJob)) {
          const selectedJob = {...buildJob}
          selectedJobs.push(selectedJob)
          if (selectedJob.builds) {
            selectedJob.builds = selectedJob.builds.filter(key => jobs.build.some(buildJob => buildJob.key === key))
            if (recursive) {
              const dependencyJobs = prepareBuildJobs(
                jobs,
                filteredJob => !selectedJobs.some(selectedJob => selectedJob.key === filteredJob.key) && selectedJob.builds!.includes(filteredJob.key!),
                recursive
              )
              selectedJobs.push(...dependencyJobs)
            }
          }
        }
        return selectedJobs
      }, [] as Job[])
    }

    function sortJobs(jobs: Job[]) {
      return jobs.sort((job1, job2) => {
        if (job1['package-index'] > job2['package-index']) return 1
        else if (job1['package-index'] < job2['package-index']) return -1
        else return 0
      })
    }
  }

  function makeJob(baseJob: Job, {type, extension}: {type: string, extension?: Partial<Job>}): Job {
    const job = {
      ...baseJob,
      ...extension,
      runner: extension?.runner ? (Runner[extension.runner as keyof typeof Runner] ?? extension.runner) : baseJob.runner,
      env: {...baseJob.env, ...extension?.env}
    }

    const description = Object.entries({
      runner: Object.keys(Runner).find(runner => Runner[runner as keyof typeof Runner] === job.runner) ?? job.runner,
      container: job.container,
      node: job['node-version'],
      java: job['java-version'],
      python: job['python-version'],
      ruby: job['ruby-version'],
      framework: job['framework-version'],
      [type]: job[`${type as 'build' | 'test'}-type`],
    })
      .flatMap(([key, value]) => value ? `${key}: ${value}` : [])
      .join(', ')
    job['display-name'] = `${job['display-name'] ?? job.name} ${description ? `(${description})` : ''}`.trim()

    job.artifacts &&= job.artifacts.map(artifactPath => {
      return (path.isAbsolute(artifactPath) || artifactPath.startsWith('~'))
        ? artifactPath
        : path.join(job['working-directory'], artifactPath)
    })

    job.key &&= populateString(job.key, {filename: type === 'test', sha: type === 'build'})
    job.builds &&= job.builds.map(key => populateString(key, {sha: true}))

    return job

    function populateString(string: string, options?: {filename?: boolean, sha?: boolean}): string {
      let result = string.replace(/\{\{([^}]+)\}\}/g, (_, name) => {
        if (name === 'environment') return environment
        else if (name === 'component') return job.name
        else return job[name as keyof Job] as string
      })
      if (options?.filename) result = result.replace(/[\/\s:]+/g, '-')
      if (options?.sha) result += `#${sha}`
      return result
    }
  }

  function getSha(): string { 
    const sha = execSync(`git --no-pager log --format=%H -n 1`, {encoding: 'utf8'})
    return sha.trim()
  }

  function getChangedPackageNames(): string[] {
    const mergeBase = execSync(`git merge-base origin/${process.env.GITHUB_BASE_REF || 'master'} ${sha}`, {encoding: 'utf8'}).trim()
    core.debug(`merge base - ${mergeBase}`)
    const changedFiles = execSync(`git --no-pager diff --name-only ${mergeBase}`, {encoding: 'utf8'})
    core.debug(`changed files - ${changedFiles}`)
    const changedPackageNames = changedFiles.split('\n').reduce((changedPackageNames, changedFile) => {
      const changedPackage = packages.find(changedPackage => {
        const changedPackagePath = path.resolve(process.cwd(), changedPackage.path) + '/'
        const changedFilePath = path.resolve(process.cwd(), changedFile)
        return changedFilePath.startsWith(changedPackagePath)
      })
      if (changedPackage) changedPackageNames.add(changedPackage.component)
      return changedPackageNames
    }, new Set<string>())
    return Array.from(changedPackageNames.values())
  }

  function getPackageNamesFromTags(tags: string[]): string[] {
    return tags.map(tag => tag.replace(/@[^@]+$/, ''))
  }
}
