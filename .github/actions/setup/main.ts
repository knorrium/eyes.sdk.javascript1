import type {Job, Package} from './types.js'
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
    core.debug(err)
    core.setFailed(err.message)
  })

async function main() {
  const sha = await getSha()
  const packages = await getPackages()
  const envs = core.getInput('env').split(/[;\s]+/).reduce((envs, env) => {
    const [key, value] = env.split('=')
    return {...envs, [key]: value}
  }, {})


  const type = core.getInput('type')
  const ci = type.startsWith('ci')
  const release = type === 'release'
  const environment = ['ci-prod', 'release'].includes(type) ? 'prod' : 'dev'

  let input: string
  if (ci) {
    input = getChangedPackagesInput()
    core.notice(`Changed packages: "${input}"`)
  } else if (release) {
    const tags = core.getMultilineInput('tag').flatMap(tag => tag.split(/[\s\n,]+/))
    input = getPackagesInputFromTags(tags)
    core.notice(`Release packages: "${input}"`)
  } else {
    input = core.getInput('packages') 
    core.notice(`Requested packages: "${input}"`)
  }

  let jobs = createJobs(input)

  core.debug(JSON.stringify(jobs, null, 2))

  if (Object.values(jobs.builds).flat().length > 0) {
    core.info(`Build jobs: "${Object.values(jobs.builds).flat().map(job => job['display-name']).join(', ')}"`)
    core.setOutput('builds', jobs.builds)
  }
  if (Object.values(jobs.tests).flat().length > 0) {
    core.info(`Test jobs: "${Object.values(jobs.tests).flat().map(job => job['display-name']).join(', ')}"`)
    core.setOutput('tests', jobs.tests)
  }
  if (Object.values(jobs.releases).flat().length > 0) {
    core.info(`Release jobs: "${Object.values(jobs.releases).flat().map(job => job['display-name']).join(', ')}"`)
    core.setOutput('releases', jobs.releases)
  }

  async function getPackages(): Promise<Record<string, Package>> {
    const releaseConfigPath = path.resolve(process.cwd(), './release-please-config.json')
    const releaseConfig = JSON.parse(await fs.readFile(releaseConfigPath, {encoding: 'utf8'}))
    const packages = await Object.entries(releaseConfig.packages as Record<string, any>).reduce(async (packages, [packagePath, packageConfig], index) => {
      if (packageConfig.component.startsWith('js/')) {
        const packageManifestPath = path.resolve(packagePath, 'package.json')
        const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
        return packages.then(packages => {
          packages[manifest.name] = {
            index,
            name: manifest.name,
            version: manifest.version,
            component: packageConfig.component,
            path: packagePath,
            tests: packageConfig.tests ?? [],
            builds: packageConfig.builds ?? [],
            releases: packageConfig.releases ?? [],
          }
          return packages
        })
      }
      if (packageConfig.component.startsWith('java/')) {
        const packageManifestPath = path.resolve(packagePath, 'pom.xml')
        const manifest = await fs.readFile(packageManifestPath, 'utf-8')
        const pomJson = xml.xml2js(manifest, { compact: true }) as xml.ElementCompact
        return packages.then(packages => {
          packages[pomJson.project.name._text] = {
            index,
            name: pomJson.project.name._text,
            version: pomJson.project.version._text,
            component: packageConfig.component,
            path: packagePath,
            tests: packageConfig.tests ?? [],
            builds: packageConfig.builds ?? [],
            releases: packageConfig.releases ?? [],
          }
          return packages
        })
      }
      if (packageConfig.component.startsWith('python/')) {
          const setupConfigFilePath = path.resolve(packagePath, 'setup.cfg')
          const manifest = ini.parse(await fs.readFile(setupConfigFilePath, 'utf-8'))
          return packages.then(packages => {
              packages[manifest.metadata.name] = {
                  index,
                  name: manifest.metadata.name,
                  version: manifest.metadata.version,
                  component: packageConfig.component,
                  path: packagePath,
                  tests: packageConfig.tests ?? [],
                  builds: packageConfig.builds ?? [],
                  releases: packageConfig.releases ?? [],
              }
              return packages
          })
      }
      return packages
    }, Promise.resolve({} as Record<string, Package>))
    return packages
  }

  function getSha(): string { 
    const sha = execSync(`git --no-pager log --format=%H -n 1`, {encoding: 'utf8'})
    return sha.trim()
  }

  function createJobs(input: string): {builds: Record<string, Job[]>, tests: Record<string, Job[]>, releases: Record<string, Job[]>} {
    const jobs = input.split(/[\s,]+(?=(?:[^()]*\([^())]*\))*[^()]*$)/).reduce((jobs, input) => {
      let [_, packageKey, frameworkVersion, langName, langVersion, runner, shortFrameworkVersion]
        = input.match(/^(.*?)(?:\((?:framework-version:([\d.]+);?)?(?:(node|python|java|ruby)-version:([\d.]+);?)?(?:runner:(linux|ubuntu|linuxarm|ubuntuarm|mac|macos|win|windows);?)?\))?(?:@([\d.]+))?$/i) ?? []
      frameworkVersion ??= shortFrameworkVersion
  
      const packageInfo = Object.values(packages).find(({name, path, component}) => [name, component, path].includes(packageKey))
      if (!packageInfo) {
        core.warning(`Package name is unknown! Package configured as "${input}" will be ignored!`)
        return jobs
      }

      const [type] = packageInfo.path.split('/', 1)
      const baseJob = {
        name: packageInfo.component,
        'short-name': packageInfo.component.replace(/^.+?\//, ''),
        'display-name': packageInfo.component,
        'package-name': packageInfo.name,
        'package-index': packageInfo.index,
        'package-version': packageInfo.version,
        'working-directory': packageInfo.path,
        runner: Runner[runner as keyof typeof Runner],
        [`${langName}-version`]: langVersion,
        [`framework-version`]: frameworkVersion,
        env: envs
      }

      if (ci) {
        jobs.builds[type] ??= []
        jobs.tests[type] ??= []
        packageInfo.builds.forEach(extension => {
          jobs.builds[type].push(makeJob(baseJob, {type: 'build', extension}))
        })
        packageInfo.tests.forEach(extension => {
          if (packageInfo.builds.length > 0) extension['build-type'] ??= 'none'
          jobs.tests[type].push(makeJob(baseJob, {type: 'test', extension}))
        })
      }

      if (release) {
        jobs.builds[type] ??= []
        jobs.releases[type] ??= []
        packageInfo.builds.forEach(extension => {
          jobs.builds[type].push(makeJob(baseJob, {type: 'build', extension}))
        })
        packageInfo.releases.forEach(extension => {
          jobs.releases[type].push(makeJob(baseJob, {type: 'release', extension}))
        })
      }

      if (!release && (!ci || packageInfo.tests.length === 0)) {
        jobs.tests[type] ??= []
        jobs.tests[type].push(makeJob(baseJob, {type: 'test'}))
      }

      return jobs
    }, {builds: {} as Record<string, Job[]>, tests: {} as Record<string, Job[]>, releases: {} as Record<string, Job[]>})
    
    Object.values(jobs).forEach((jobsGroup) => {
      Object.entries(jobsGroup).forEach(([type, jobs]) => {
        jobsGroup[type] = jobs.sort((job1, job2) => {
          if (job1['package-index'] > job2['package-index']) return 1
          else if (job1['package-index'] < job2['package-index']) return -1
          else return 0
        })
      })
    })

    const builds = Object.values(jobs.builds).flat().reduce((builds, buildJob) => {
      if (buildJob.artifacts && buildJob.key) {
        builds[buildJob.key] = {name: buildJob.name, artifacts: buildJob.artifacts}
      }
      return builds
    }, {} as Record<string, {name: string, artifacts: string[]}>)

    if (ci || release) {
      Object.values(ci ? jobs.tests : jobs.releases).flat().forEach(job => {
        const jobBuilds = job.builds
          ? Object.fromEntries(Object.entries(builds).filter(([key]) => job.builds!.includes(key)))
          : Object.fromEntries(Object.entries(builds).filter(([, {name}]) => job.name === name))
        job.builds = Object.entries(jobBuilds).map(([key, {artifacts}]) => `${key}$${artifacts.join(';')}`)
      })
    }

    if (ci) {
      Object.values(jobs.builds).flat().forEach(job => {
        if (job.builds) {
          const jobBuilds = Object.fromEntries(Object.entries(builds).filter(([key]) => job.builds!.includes(key)))
          job.builds = Object.entries(jobBuilds).map(([key, {artifacts}]) => `${key}$${artifacts.join(';')}`)
        }
      })
    }

    return jobs

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
        if (options?.filename) result = result.replace(/[\/\s]+/g, '-')
        if (options?.sha) result += `#${sha}`
        return result
      }
    }
  }

  function getChangedPackagesInput(): string {
    const changedFiles = execSync(`git --no-pager diff --name-only $(git merge-base --fork-point origin/${process.env.GITHUB_BASE_REF || 'master'})`, {encoding: 'utf8'})
    const changedPackageNames = changedFiles.split('\n').reduce((changedPackageNames, changedFile) => {
      const changedPackage = Object.values(packages).find(changedPackage => {
        const changedPackagePath = path.resolve(process.cwd(), changedPackage.path) + '/'
        const changedFilePath = path.resolve(process.cwd(), changedFile)
        return changedFilePath.startsWith(changedPackagePath)
      })
      if (changedPackage) changedPackageNames.add(changedPackage.component)
      return changedPackageNames
    }, new Set())
    return Array.from(changedPackageNames.values()).join(' ')
  }

  function getPackagesInputFromTags(tags: string[]): string {
    return tags.map(tag => tag.replace(/@[^@]+$/, '')).join(' ')
  }

  function getAllPackagesInput(): string {
    return Object.values(packages).map(({component}) => component).join(' ')
  }
}
