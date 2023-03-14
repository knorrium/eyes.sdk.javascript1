import {execSync} from 'node:child_process'
import * as core from '@actions/core'
import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import INI from 'ini'

interface Package {
  name: string
  aliases: string[]
  jobName: string
  dirname: string
  path: string
  tag: string
  dependencies: string[]
  framework?: string
}

interface Job {
  name: string,
  displayName: string,
  packageName: string,
  dirname: string,
  path: string,
  tag: string,
  params?: {
    version?: string,
    runner?: string,
    node?: string,
    links?: string,
    env?: Record<string, string>,
  }
  requested: boolean,
}

enum Runner {
  linux = 'ubuntu-latest',
  ubuntu = 'ubuntu-latest',
  linuxarm = 'buildjet-2vcpu-ubuntu-2204-arm',
  ubuntuarm = 'buildjet-2vcpu-ubuntu-2204-arm',
  mac = 'macos-latest',
  macos = 'macos-latest',
  win = 'windows-2022',
  windows = 'windows-2022',
}

const SKIP_PACKAGES = [
  // tools
  '@applitools/bongo',
  '@applitools/sdk-coverage-tests',
  '@applitools/api-extractor',
  '@applitools/snaptdout',
  '@applitools/fancy',
  // legacy
  '@applitools/visual-grid-client',
  '@applitools/types',
  '@applitools/sdk-fake-eyes-server',
  '@applitools/eyes-sdk-core',
  '@applitools/eyes-universal',
  '@applitools/eyes-selenium-universal',
  '@applitools/eyes-playwright-universal',
  '@applitools/eyes-webdriverio5-service',
  '@applitools/eyes.webdriverio',
  '@applitools/eyes-protractor',
  'applitools-for-selenium-ide',
]

let input = core.getInput('packages', {required: true}) 
const defaultEnv = core.getInput('env')
const allowVariations = core.getBooleanInput('allow-variations')
const includeOnlyChanged = core.getBooleanInput('include-only-changed')
const includeDependencies = core.getBooleanInput('include-dependencies')
const linkDependencies = core.getBooleanInput('link-dependencies')
const defaultPublishVersion = core.getInput('default-publish-version')

const packages = await getPackages()

if (input === 'changed') {
  input = getChangedPackagesInput()
  core.notice(`Changed packages: "${input}"`)
} else if (input === 'all') {
  input = getAllPackagesInput()
  core.notice(`All packages: "${input}"`)
} else {
  core.notice(`Input provided: "${input}"`)
}

let jobs = createJobs(input)

core.info(`Requested jobs: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)

if (includeDependencies) {
  const additionalJobs = createDependencyJobs(jobs)
  jobs = {...jobs, ...additionalJobs}
  core.info(`Requested and dependant jobs: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)
}

if (includeOnlyChanged) {
  jobs = filterInsignificantJobs(jobs)
  core.info(`Filtered jobs: "${Object.values(jobs).map(job => job.displayName).join(', ')}"`)
}

core.setOutput('packages', allowVariations ? Object.values(jobs) : jobs)

async function getPackages(): Promise<Record<string, Package>> {
  const jsPackagesPath = path.resolve(process.cwd(), './js/packages')
  const jsPackageDirs = await fs.readdir(jsPackagesPath)
  const jsPackages = await jsPackageDirs.reduce(async (packages, packageDir) => {
    const packagePath = path.resolve(jsPackagesPath, packageDir)
    const packageManifestPath = path.resolve(packagePath, 'package.json')
    if (!(await fs.stat(packageManifestPath).catch(() => false))) return packages

    const manifest = JSON.parse(await fs.readFile(packageManifestPath, {encoding: 'utf8'}))
    if (SKIP_PACKAGES.includes(manifest.name)) return packages

    return packages.then(packages => {
      packages[manifest.name] = {
        name: manifest.name,
        aliases: manifest.aliases,
        jobName: manifest.aliases?.[0] ?? packageDir,
        dirname: packageDir,
        path: packagePath,
        tag: `${manifest.name}@`,
        dependencies: Object.keys({...manifest.dependencies, ...manifest.devDependencies}),
        framework: Object.keys({...manifest.peerDependencies})[0],
      }
      return packages
    })
  }, Promise.resolve({} as Record<string, Package>))
  Object.values(jsPackages).forEach(packageInfo => {
    packageInfo.dependencies = packageInfo.dependencies.filter(depName => jsPackages[depName])
  })

  const pyPackagesPath = path.resolve(process.cwd(), './python')
  const pyPackageDirs = await fs.readdir(pyPackagesPath)
  const pyPackages = await pyPackageDirs.reduce(async (packages, packageDir) => {
    const packagePath = path.resolve(pyPackagesPath, packageDir)
    const packageManifestPath = path.resolve(packagePath, 'setup.cfg')
    if (!(await fs.stat(packageManifestPath).catch(() => false))) return packages

    const {iniString} = await fs.readFile(packageManifestPath, {encoding: 'utf8'}).then(iniString => {
      return iniString.split(/[\n\r]+/).reduce(({lastField, iniString}, line) => {
        const indent = line.slice(0, Array.from(line).findIndex(char => char !== ' ' && char !== '\t'))
        if (!lastField || indent.length <= lastField.indent.length) {
          const [key] = line.split(/\s?=/, 1)
          lastField = {key, indent}
          iniString += line + '\n'
        } else {
          iniString += lastField.indent + `${lastField.key}[]=` + line.trim() + '\n'
        }
        return {lastField, iniString}
      }, {lastField: null as null | {key: string, indent: string}, iniString: ''})
    })
    const manifest = INI.parse(iniString) as any

    return packages.then(packages => {
      const packageName = manifest.metadata.name.replace('_', '-')
      const alias = packageName.replace('eyes-', '')
      const dependencies = (manifest.options.install_requires ?? []) as string[]
      packages[packageName] = {
        name: packageName,
        jobName: `python-${alias}`,
        aliases: [`py-${alias}`, `python-${alias}`],
        dirname: packageDir,
        path: packagePath,
        tag: `@applitools/python/${packageDir}@`,
        dependencies: dependencies.map(depString => depString.split(/[<=>]/, 1)[0])
      }
      return packages
    })
  }, Promise.resolve({} as Record<string, Package>))
  Object.values(pyPackages).forEach(packageInfo => {
    packageInfo.dependencies = packageInfo.dependencies.filter(depName => pyPackages[depName])
  })

  pyPackages['core-universal'].dependencies.push('@applitools/core')

  return {...jsPackages}
}

function createJobs(input: string): Record<string, Job> {
  return input.split(/[\s,]+(?=(?:[^()]*\([^())]*\))*[^()]*$)/).reduce((jobs, input) => {
    let [_, packageKey, publishVersion, frameworkVersion, frameworkProtocol, nodeVersion, jobOS, linkPackages, shortPublishVersion, shortFrameworkVersion, shortFrameworkProtocol]
      = input.match(/^(.*?)(?:\((?:version:(patch|minor|major);?)?(?:framework:([\d.]+);?)?(?:protocol:(.+?);?)?(?:node:([\d.]+);?)?(?:os:(linux|ubuntu|mac|macos|win|windows);?)?(?:links:(.+?);?)?\))?(?::(patch|minor|major))?(?:@([\d.]+))?(?:\+(.+?))?$/i) ?? []
  
    publishVersion ??= shortPublishVersion ?? defaultPublishVersion
    frameworkVersion ??= shortFrameworkVersion
    frameworkProtocol ??= shortFrameworkProtocol

    const packageInfo = Object.values(packages).find(({name, jobName, dirname, aliases}) => {
      return [name, jobName, dirname, ...(aliases ?? [])].includes(packageKey)
    })
  
    if (!packageInfo) {
      core.warning(`Package name is unknown! Package configured as "${input}" will be ignored!`)
      return jobs
    }
    if (frameworkVersion || frameworkProtocol) {
      if (!allowVariations) {
        core.warning(`Modifiers are not allowed! Package "${packageInfo.name}" configured as "${input}" will be ignored!`)
        return jobs
      } else if (!packageInfo.framework) {
        core.warning(`Framework modifiers are not allowed for package "${packageInfo.name}"! Package configured as "${input}" will be ignored!`)
        return jobs
      }
    }
  
    const envs = defaultEnv.split(';').reduce((envs, env) => {
      const [key, value] = env.split('=')
      return {...envs, [key]: value}
    }, {})

    const appendix = Object.entries({version: publishVersion, framework: frameworkVersion, protocol: frameworkProtocol, node: nodeVersion, os: jobOS})
      .reduce((parts, [key, value]) => value ? [...parts, `${key}: ${value}`] : parts, [] as string[])
      .join('; ')
    const job = {
      name: packageInfo.jobName,
      displayName: `${packageInfo.jobName}${appendix ? ` (${appendix})` : ''}`,
      packageName: packageInfo.name,
      dirname: packageInfo.dirname,
      path: packageInfo.path,
      tag: packageInfo.tag,
      params: {
        version: publishVersion,
        runner: Runner[jobOS as keyof typeof Runner] ?? Runner.linux,
        node: nodeVersion ?? 'lts/*',
        links: linkDependencies ? packageInfo.dependencies.join(',') : linkPackages,
        env: {
          [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_MAJOR_VERSION`]: frameworkVersion,
          [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_VERSION`]: frameworkVersion,
          [`APPLITOOLS_${packageInfo.jobName.toUpperCase()}_PROTOCOL`]: frameworkProtocol,
          ...envs,
        },
      },
      requested: true,
    } as Job
  
    jobs[allowVariations ? job.displayName : job.name] = job
  
    return jobs
  }, {} as Record<string, Job>)
}

function createDependencyJobs(jobs: Record<string, Job>) {
  const packageNames = Object.values(jobs).map(job => job.packageName)
  const dependencyJobs = {} as Record<string, Job>

  for (const packageName of packageNames) {
    for (const dependencyName of packages[packageName].dependencies) {
      if (packageNames.includes(dependencyName)) continue
      packageNames.push(dependencyName)
      dependencyJobs[packages[dependencyName].jobName] = {
        name: packages[dependencyName].jobName,
        displayName: packages[dependencyName].jobName,
        packageName: packages[dependencyName].name,
        dirname: packages[dependencyName].dirname,
        path: packages[dependencyName].path,
        tag: packages[dependencyName].tag,
        params: {
          links: linkDependencies ? packages[dependencyName].dependencies.join(',') : undefined,
        },
        requested: false
      }
    }
  }

  return dependencyJobs
}

function filterInsignificantJobs(jobs: Record<string, Job>) {
  const filteredJobs = Object.entries(jobs).reduce((filteredJobs, [jobName, job]) => {
    if (job.requested || changedSinceLastTag(job)) filteredJobs[jobName] = job
    return filteredJobs
  }, {} as Record<string, Job>)

  let more = true
  while (more) {
    more = false
    for (const [jobName, job] of Object.entries(jobs)) {
      if (filteredJobs[jobName]) continue
      if (packages[job.packageName].dependencies.some(packageName => Object.values(filteredJobs).some(job => job.packageName === packageName))) {
        more = true
        filteredJobs[jobName] = job
      }
    }
  }

  return filteredJobs
}

function changedSinceLastTag(job: Job) {
  let tag
  try {
    tag = execSync(`git describe --tags --match "${job.tag}*" --abbrev=0`, {encoding: 'utf8'}).trim()
  } catch {}

  if (!tag) return true

  const commits = execSync(`git log ${tag}..HEAD --oneline -- ${job.path}`, {encoding: 'utf8'})
  return Boolean(commits)
}

function getChangedPackagesInput(): string {
  const changedFiles = execSync('git --no-pager diff --name-only origin/master', {encoding: 'utf8'})
  const changedPackageNames = changedFiles.split('\n').reduce((changedPackageNames, changedFile) => {
    const changedPackage = Object.values(packages).find(changedPackage => {
      const changedFilePath = path.resolve(process.cwd(), changedFile, './')
      return changedFilePath.startsWith(changedPackage.path + '/')
    })
    if (changedPackage) changedPackageNames.add(changedPackage.jobName)
    return changedPackageNames
  }, new Set())
  return Array.from(changedPackageNames.values()).join(' ')
}

function getAllPackagesInput(): string {
  return Object.values(packages).map(({jobName}) => jobName).join(' ')
}
