import {type GitHub} from 'release-please/build/src/github'
import {type ReleasePullRequest} from 'release-please/build/src/release-pull-request'
import {type Strategy} from 'release-please/build/src/strategy'
import {type BaseStrategy} from 'release-please/build/src/strategies/base'
import {type Version} from 'release-please/build/src/version'
import {type Release} from 'release-please/build/src/release'
import {type Commit, type ConventionalCommit} from 'release-please/build/src/commit'
import {type Update} from 'release-please/build/src/update'
import {type WorkspacePlugin, type WorkspacePluginOptions, type DependencyGraph, type AllPackages} from 'release-please/build/src/plugins/workspace'
import {DEFAULT_RELEASE_PLEASE_MANIFEST, type RepositoryConfig, type CandidateReleasePullRequest} from 'release-please/build/src/manifest'
import {Changelog} from 'release-please/build/src/updaters/changelog'
import {ReleasePleaseManifest} from 'release-please/build/src/updaters/release-please-manifest';
import {ManifestPlugin} from 'release-please/build/src/plugin'
import {buildPlugin} from 'release-please/build/src/factories/plugin-factory'

type RichChangelogEntry = {
  header: string
  sections: string[]
  bumps: {packageName: string, from?: string, to: string, sections: string[]}[]
}

export interface RichWorkspaceOptions extends WorkspacePluginOptions {
  workspaces: ('node' | 'maven' | 'python' | 'ruby')[]
  'synthetic-dependencies': {dependency: string, dependents: (string | {component: string, 'inherit-version'?: boolean})[]}[]
}

export class RichWorkspace extends ManifestPlugin {
  private index = -1
  protected manifestPath: string
  protected plugins: WorkspacePlugin<unknown>[]
  protected syntheticDependencies: {dependency: string, dependents: {component: string, inheritVersion: boolean}[]}[]
  protected order: string[] = []
  protected paths = {byComponent: {} as Record<string, string>, byPackageName: {} as Record<string, string>} 
  protected components = {byPath: {} as Record<string, string>, byPackageName: {} as Record<string, string>} 
  protected packageNames = {byComponent: {} as Record<string, string>, byPath: {} as Record<string, string>} 
  protected strategiesByPath = {} as Record<string, Strategy>
  protected commitsByPath = {} as Record<string, ConventionalCommit[]>
  protected releasesByPath = {} as Record<string, Release>
  protected releasePullRequestsByPath = {} as Record<string, ReleasePullRequest | undefined>
  protected richChangelogEntriesByCandidate = new Map<CandidateReleasePullRequest, RichChangelogEntry>()

  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    options: RichWorkspaceOptions
  ) {
    super(github, targetBranch, repositoryConfig, options.logger);
    this.manifestPath = options.manifestPath ?? DEFAULT_RELEASE_PLEASE_MANIFEST;
    this.plugins = options.workspaces.map(workspaceName => {
      return this.patchWorkspacePlugin(buildPlugin({
        ...options,
        type: {type: `${workspaceName}-workspace`, merge: false},
        github,
        targetBranch,
        repositoryConfig,
        manifestPath: this.manifestPath
      }) as WorkspacePlugin<unknown>)
    })
    this.syntheticDependencies = options['synthetic-dependencies'].map(({dependency, dependents}) => {
      return {
        dependency,
        dependents: dependents.map(dependent => {
          return typeof dependent === 'string'
            ? {component: dependent, inheritVersion: false}
            : {component: dependent.component, inheritVersion: dependent['inherit-version'] ?? false}
        })
      }
    })
  }

  async preconfigure(
    strategiesByPath: Record<string, Strategy>,
    _commitsByPath: Record<string, Commit[]>,
    releasesByPath: Record<string, Release>
  ): Promise<Record<string, Strategy>> {
    this.strategiesByPath = strategiesByPath as Record<string, BaseStrategy>
    this.releasesByPath = releasesByPath
    this.order = Object.keys(this.strategiesByPath)
    await Promise.all(Object.entries(strategiesByPath).map(async ([path, strategy]) => {
      const component = await strategy.getComponent()
      if (component) this.paths.byComponent[component] = path
      this.components.byPath[path] = component ?? ''
    }))
    return this.strategiesByPath
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.index += 1
    this.commitsByPath[Object.keys(this.strategiesByPath)[this.index]] = commits
    return commits
  }

  async run(candidates: (CandidateReleasePullRequest & {isSynthetic?: boolean})[]) {
    const updatedCandidates = await this.plugins.reduce((promise, plugin) => promise.then(async candidates => {
      for (const {dependency, dependents} of this.syntheticDependencies) {
        const dependencyCandidate = candidates.find(candidate => this.components.byPath[candidate.path] === dependency && this.packageNames.byPath[candidate.path])
        if (dependencyCandidate) {
          for (const dependent of dependents) {
            const candidate = candidates.find(candidate => this.components.byPath[candidate.path] === candidate.path)
            if (!candidate?.isSynthetic) {
              this.logger.info(`adding synthetic dependency ${dependency} to ${dependent.component}`)
              const pullRequest = await this.buildDependentReleasePullRequest(dependencyCandidate, dependent)
              if (candidate) {
                candidate.isSynthetic = true
                candidate.pullRequest = pullRequest
              } else {
                const path = this.paths.byComponent[dependent.component]
                candidates.push({path, pullRequest, config: this.repositoryConfig[path], isSynthetic: true})
              }
            }
          }
        }
      }

      for (const [path, strategy] of Object.entries(this.strategiesByPath)) {
        this.releasePullRequestsByPath[path] = 
          candidates.find(candidate => candidate.path === path)?.pullRequest ??
          (await strategy.buildReleasePullRequest([...this.commitsByPath[path], ...this.generateDepsCommits()], this.releasesByPath[path]))!
      }

      return plugin.run(candidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release')))
    }), Promise.resolve(candidates))

    updatedCandidates.forEach(candidate => this.enrichChangelogEntry(candidate, updatedCandidates))
    return updatedCandidates
      .filter(candidate => !candidate.pullRequest.labels.includes('skip-release'))
      .sort((candidate1, candidate2) => this.order.indexOf(candidate1.path) > this.order.indexOf(candidate2.path) ? 1 : -1)
  }

  protected async buildDependentReleasePullRequest(dependencyCandidate: CandidateReleasePullRequest, dependent: {component: string, inheritVersion: boolean}) {
    const path = this.paths.byComponent[dependent.component]
    const strategy = this.strategiesByPath[path]
    if (dependent.inheritVersion) {
      (strategy as any).releaseAs = dependencyCandidate.pullRequest.version!.toString()
    }
    const pullRequest = (await strategy.buildReleasePullRequest([...this.commitsByPath[path], ...this.generateDepsCommits([dependencyCandidate])], this.releasesByPath[path]))!
    pullRequest.updates.push({
      path: this.manifestPath,
      createIfMissing: false,
      updater: new ReleasePleaseManifest({
        version: pullRequest.version!,
        versionsMap: new Map([[path, pullRequest.version!]]),
      })
    })
    return pullRequest
  }

  protected enrichChangelogEntry(candidate: CandidateReleasePullRequest, candidates: CandidateReleasePullRequest[]): RichChangelogEntry | null {
    if (this.richChangelogEntriesByCandidate.has(candidate)) return this.richChangelogEntriesByCandidate.get(candidate)!

    const update = candidate.pullRequest.updates.find((update): update is Update & {updater: Changelog} => update.updater instanceof Changelog)
    if (!update) return null
    const richChangelogEntry = {} as RichChangelogEntry
    richChangelogEntry.header = extractChangelogEntryHeader(update.updater.changelogEntry)
    richChangelogEntry.sections = extractChangelogEntrySections(update.updater.changelogEntry).map(section => {
      if (!isDependencySection(section)) return section
      richChangelogEntry.bumps = extractBumps(section).reduce((bumps, bump) => {
        if (bumps.every(existedBump => bump.packageName !== existedBump.packageName)) {
          const bumpedCandidate = candidates.find(candidate => candidate.path === this.paths.byPackageName[bump.packageName])
          if (bumpedCandidate) {
            const bumpedRichChangelogEntry = this.enrichChangelogEntry(bumpedCandidate, candidates)
            if (bumpedRichChangelogEntry) {
              return bumps.concat(
                {...bump, sections: bumpedRichChangelogEntry.sections.filter(section => !isDependencySection(section))},
                bumpedRichChangelogEntry.bumps.filter(bump => bumps.every(existedBump => bump.packageName !== existedBump.packageName)) ?? []
              )
            }
          }
          return bumps.concat({...bump, sections: []})
        }
        return bumps
      }, [] as RichChangelogEntry['bumps'])
      const dependencies = richChangelogEntry.bumps
        .sort((bump1, bump2) => {
          const bump1HasSections = bump1.sections.length > 0
          const bump2HasSections = bump2.sections.length > 0
          if (bump1HasSections && !bump2HasSections) return -1
          else if (bump1HasSections && !bump2HasSections) return 1
          else return this.order.indexOf(this.paths.byPackageName[bump1.packageName]) > this.order.indexOf(this.paths.byPackageName[bump2.packageName]) ? 1 : -1
        })
        .map(bump => 
          `* ${bump.packageName} bumped ${bump.from ? `from ${bump.from} ` : ''}to ${bump.to}\n${bump.sections.map(section => `  #${section.replace(/(\n+)([^\n])/g, '$1  $2')}`).join('')}`
        )
      return `### Dependencies\n\n${dependencies.join('\n')}`
    })
    richChangelogEntry.bumps ??= []
    this.richChangelogEntriesByCandidate.set(candidate, richChangelogEntry)
    const changelogEntry = `${richChangelogEntry.header}${richChangelogEntry.sections.join('')}`
    update.updater.changelogEntry = changelogEntry
    candidate.pullRequest.body.releaseData[0].notes = changelogEntry

    return richChangelogEntry

    function extractChangelogEntryHeader(changelogEntry: string) {
      const [header] = changelogEntry.match(/^##[^#]+/) ?? ['']
      return header
    }
  
    function extractChangelogEntrySections(changelogEntry: string) {
      return Array.from(changelogEntry.matchAll(/###.+?(?=###|$)/gs), ([section]) => section)
    }
  
    function isDependencySection(changelogEntrySection: string) {
      return changelogEntrySection.startsWith('### Dependencies\n\n')
    }
  
    function extractBumps(dependencySection: string) {
      return Array.from(dependencySection.matchAll(/\* (?<packageName>\S+) bumped (?:from (?<from>[\d\.]+) )?to (?<to>[\d\.]+)/gm), match => (match.groups! as any as RichChangelogEntry['bumps'][number]))
    }
  }

  protected patchWorkspacePlugin(workspacePlugin: WorkspacePlugin<unknown>): WorkspacePlugin<unknown> {
    // const originalBuildGraph = (workspacePlugin as any).buildGraph.bind(workspacePlugin)
    // ;(workspacePlugin as any).buildGraph = async (pkgs: unknown[]): Promise<DependencyGraph<any>> => {
    //   const graph = await originalBuildGraph(pkgs)
    //   // for (const packageName of graph.keys()) {
    //   //   let packageStrategy = this.strategiesByPath[this.pathsByPackagesName[packageName]] as BaseStrategy | undefined
    //   //   if (packageStrategy?.extraLabels.includes('skip-release')) {
    //   //     graph.delete(packageName)
    //   //   }
    //   // }
    //   return graph
    // }

    // collect package names
    const originalBuildAllPackages = (workspacePlugin as any).buildAllPackages.bind(workspacePlugin)
    ;(workspacePlugin as any).buildAllPackages = async (candidates: CandidateReleasePullRequest[]): Promise<AllPackages<unknown>> => {
      const result: AllPackages<unknown> = await originalBuildAllPackages(candidates)
      result.allPackages.forEach(pkg => {
        const path = (workspacePlugin as any).pathFromPackage(pkg)
        const packageName = (workspacePlugin as any).packageNameFromPackage(pkg)
        const component = this.components.byPath[path]
        this.packageNames.byPath[path] = packageName
        this.packageNames.byComponent[component] = packageName
        this.paths.byPackageName[packageName] = path
        this.components.byPackageName[packageName] = component
      })
      return result
    }

    // create a proper new candidate
    const originalNewCandidate = (workspacePlugin as any).newCandidate.bind(workspacePlugin)
    ;(workspacePlugin as any).newCandidate = (pkg: unknown, updatedVersions: Map<string, Version>): CandidateReleasePullRequest => {
      const originalCandidate = originalNewCandidate(pkg, updatedVersions)
      if (this.releasePullRequestsByPath[originalCandidate.path]) {
        const candidate = {
          path: originalCandidate.path,
          pullRequest: this.releasePullRequestsByPath[originalCandidate.path],
          config: this.repositoryConfig[originalCandidate.path]
        }
        return (workspacePlugin as any).updateCandidate(candidate, pkg, updatedVersions)
      } else {
        // some plugins (e.g. maven) tries to update not listed dependencies, so we will have to skip them
        originalCandidate.pullRequest.labels = ['skip-release']
        return originalCandidate
      }
    }

    return workspacePlugin
  }

  protected generateDepsCommits(candidates?: CandidateReleasePullRequest[]): ConventionalCommit[] {
    return candidates  && candidates.length > 0
      ? candidates.map(candidate => ({sha: '', message: '', type: 'deps', scope: null, bareMessage: `${this.packageNames.byPath[candidate.path]} bumped to ${candidate.pullRequest.version!.toString()}`, breaking: false, notes: [], references: []}))
      : [{sha: '', message: '', type: 'deps', scope: null, bareMessage: 'update some dependencies', breaking: false, notes: [], references: []}]
  }
}
