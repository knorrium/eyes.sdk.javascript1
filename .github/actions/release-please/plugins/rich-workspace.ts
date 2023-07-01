import {type GitHub} from 'release-please/build/src/github'
import {type RepositoryConfig, type CandidateReleasePullRequest} from 'release-please/build/src/manifest'
import {type ReleasePullRequest} from 'release-please/build/src/release-pull-request'
import {type Strategy} from 'release-please/build/src/strategy'
import {type BaseStrategy} from 'release-please/build/src/strategies/base'
import {type Version} from 'release-please/build/src/version'
import {type Release} from 'release-please/build/src/release'
import {type Commit, type ConventionalCommit} from 'release-please/build/src/commit'
import {type Update} from 'release-please/build/src/update'
import {type WorkspacePlugin, type WorkspacePluginOptions, type DependencyGraph, type AllPackages} from 'release-please/build/src/plugins/workspace'
import {Changelog} from 'release-please/build/src/updaters/changelog'
import {ManifestPlugin} from 'release-please/build/src/plugin'
import {buildPlugin} from 'release-please/build/src/factories/plugin-factory'

type RichChangelogEntry = {
  header: string
  sections: string[]
  bumps: {packageName: string, from?: string, to: string, sections: string[]}[]
}

export interface RichWorkspaceOptions extends WorkspacePluginOptions {
  manifestPath: string;
  workspaces: ('node' | 'maven' | 'python' | 'ruby')[]
  'synthetic-dependencies': Record<string, string[]>
}

export class RichWorkspace extends ManifestPlugin {
  private index = -1
  protected plugins: Record<string, WorkspacePlugin<unknown>>
  protected syntheticDependencies: Record<string, string[]>
  protected strategiesByPath: Record<string, Strategy> = {}
  protected commitsByPath: Record<string, ConventionalCommit[]> = {}
  protected releasesByPath: Record<string, Release> = {}
  protected releasePullRequestsByPath: Record<string, ReleasePullRequest | undefined> = {}
  protected pathsByPackagesName: Record<string, string> = {}
  protected componentsByPath: Record<string, string> = {}
  protected candidates: CandidateReleasePullRequest[] = []
  protected richChangelogEntriesByCandidate = new Map<CandidateReleasePullRequest, RichChangelogEntry>()

  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    options: RichWorkspaceOptions
  ) {
    super(github, targetBranch, repositoryConfig, options.logger);
    this.plugins = options.workspaces.reduce((plugins, workspaceName) => {
      plugins[workspaceName] = this.patchWorkspacePlugin(buildPlugin({
        ...options,
        type: {type: `${workspaceName}-workspace`, merge: false},
        github,
        targetBranch,
        repositoryConfig,
      }) as WorkspacePlugin<unknown>)
      return plugins
    }, {} as Record<string, WorkspacePlugin<unknown>>)
    this.syntheticDependencies = options['synthetic-dependencies']
  }

  async preconfigure(
    strategiesByPath: Record<string, Strategy>,
    commitsByPath: Record<string, Commit[]>,
    releasesByPath: Record<string, Release>
  ): Promise<Record<string, Strategy>> {
    this.strategiesByPath = strategiesByPath as Record<string, BaseStrategy>
    this.releasesByPath = releasesByPath
    this.componentsByPath = await Object.entries(strategiesByPath).reduce(async (promise, [path, strategy]) => {
      const component = await strategy.getComponent()
      return promise.then(componentsByPath => Object.assign(componentsByPath, {[path]: component}))
    }, Promise.resolve({} as Record<string, string>))
    return this.strategiesByPath
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.index += 1
    this.commitsByPath[Object.keys(this.strategiesByPath)[this.index]] = commits
    return commits
  }

  async run(candidates: CandidateReleasePullRequest[]) {
    const updateDepsCommit = {sha: '', message: 'deps: update some dependencies', files: [], pullRequest: undefined, type: 'deps', scope: null, bareMessage: 'update some dependencies', notes: [], references: [], breaking: false}
    this.releasePullRequestsByPath = await Object.entries(this.strategiesByPath).reduce(async (promise, [path, strategy]) => {
      const releasePullRequest = 
        candidates.find(candidate => candidate.path === path)?.pullRequest ??
        await strategy.buildReleasePullRequest([...this.commitsByPath[path], updateDepsCommit], this.releasesByPath[path])
      return promise.then(releasePullRequestsByPath => {
        releasePullRequestsByPath[path] = releasePullRequest
        return releasePullRequestsByPath
      })
    }, Promise.resolve({} as Record<string, ReleasePullRequest | undefined>))
    this.candidates = await Object.values(this.plugins).reduce(async (promise, plugin) => {
      this.candidates = await promise
      return plugin.run(this.candidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release')))
    }, Promise.resolve(candidates))

    this.candidates.forEach(candidate => this.enrichChangelogEntry(candidate, candidates))

    console.log([this.candidates])

    return this.candidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release'))
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
          const bumpedCandidate = candidates.find(candidate => candidate.path === this.pathsByPackagesName[bump.packageName])
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
        .sort((bump1, bump2) => (bump1.sections.length > 0 ? 1 : 0) > (bump2.sections.length > 0 ? 1 : 0) ? -1 : 1)
        .map(bump => {
          const header = `* ${bump.packageName} bumped ${bump.from ? `from ${bump.from} ` : ''}to ${bump.to}\n`
          if (!bump.sections) return header
          return `${header}${bump.sections.map(section => `  #${section.replace(/(\n+)([^\n])/g, '$1  $2')}`).join('')}`
        })
      return `### Dependencies\n\n${dependencies.join('\n')}`
    })
    richChangelogEntry.bumps ??= []
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
    //   for (const packageName of graph.keys()) {
    //     let packageStrategy = this.strategiesByPath[this.pathsByPackagesName[packageName]] as BaseStrategy | undefined
    //     if (packageStrategy?.extraLabels.includes('skip-release')) {
    //       graph.delete(packageName)
    //     }
    //   }
    //   return graph
    // }

    // collect package names
    const originalBuildAllPackages = (workspacePlugin as any).buildAllPackages.bind(workspacePlugin)
    ;(workspacePlugin as any).buildAllPackages = async (candidates: CandidateReleasePullRequest[]): Promise<AllPackages<unknown>> => {
      const result: AllPackages<unknown> = await originalBuildAllPackages(candidates)
      result.allPackages.forEach(pkg => {
        this.pathsByPackagesName[(workspacePlugin as any).packageNameFromPackage(pkg)] = (workspacePlugin as any).pathFromPackage(pkg)
      })
      return result
    }

    // follow the dependencies
    const originalPackageNamesToUpdate = (workspacePlugin as any).packageNamesToUpdate.bind(workspacePlugin)
    ;(workspacePlugin as any).packageNamesToUpdate = (graph: DependencyGraph<unknown>, candidatesByPackage: Record<string, CandidateReleasePullRequest>): string[] => {
      const packageNames = originalPackageNamesToUpdate(graph, candidatesByPackage)
      const additionalPackageNames = Array.from(graph.keys()).filter(packageName => {
        const syntheticDependencies = this.syntheticDependencies[this.componentsByPath[this.pathsByPackagesName[packageName]]]
        return syntheticDependencies?.some(dependencyComponent => this.candidates.some(candidate => candidate.config.component === dependencyComponent))
      })
      return [...packageNames, ...additionalPackageNames]
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
}
