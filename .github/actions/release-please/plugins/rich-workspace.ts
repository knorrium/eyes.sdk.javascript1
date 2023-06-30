import {type GitHub} from 'release-please/build/src/github'
import {type RepositoryConfig, type CandidateReleasePullRequest} from 'release-please/build/src/manifest'
import {type ReleasePullRequest} from 'release-please/build/src/release-pull-request'
import {type Strategy} from 'release-please/build/src/strategy'
import {type BaseStrategy} from 'release-please/build/src/strategies/base'
import {type Version} from 'release-please/build/src/version'
import {type Release} from 'release-please/build/src/release'
import {type Commit, type ConventionalCommit} from 'release-please/build/src/commit'
import {type Update} from 'release-please/build/src/update'
import {type WorkspacePlugin, type WorkspacePluginOptions, type DependencyGraph} from 'release-please/build/src/plugins/workspace'
import {Changelog} from 'release-please/build/src/updaters/changelog'
import {ManifestPlugin} from 'release-please/build/src/plugin'
import {buildPlugin} from 'release-please/build/src/factories/plugin-factory'

type PatchedChangelogUpdate = Update & {
  updater: Changelog,
  sections: string[],
  bumps?: Bump[]
}

type Bump = {packageName: string, from: string, to: string, sections: string[]}

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
    const updateDepsCommit = {sha: '', message: 'deps: update some dependencies', files: [], pullRequest: undefined, type: 'deps', scope: undefined, bareMessage: 'update some dependencies', notes: [], references: [], breaking: false}
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
      return plugin.run(candidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release')))
    }, Promise.resolve(candidates))

    this.patchChangelogs(this.candidates)

    return this.candidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release'))
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
    ;(workspacePlugin as any).buildAllPackages = async (candidates: CandidateReleasePullRequest[]): Promise<DependencyGraph<any>> => {
      const result = await originalBuildAllPackages(candidates)
      Object.entries(result.allPackages as unknown[]).forEach(pkg => {
        this.pathsByPackagesName[(workspacePlugin as any).packageNameFromPackage(pkg)] = (workspacePlugin as any).pathFromPackage(pkg)
      })
      return result
    }

    // follow the dependencies
    const originalPackageNamesToUpdate = (workspacePlugin as any).packageNamesToUpdate.bind(workspacePlugin)
    ;(workspacePlugin as any).packageNamesToUpdate = (
      graph: DependencyGraph<unknown>,
      candidatesByPackage: Record<string, CandidateReleasePullRequest>
    ): string[] => {
      const packageNames = originalPackageNamesToUpdate(graph, candidatesByPackage)
      console.log(this.componentsByPath, this.pathsByPackagesName)
      const additionalPackageNames = Array.from(graph.keys()).filter(packageName => {
        const syntheticDependencies = this.syntheticDependencies[this.componentsByPath[this.pathsByPackagesName[packageName]]]
        console.log(packageName, syntheticDependencies)
        return syntheticDependencies?.some(dependencyComponent => this.candidates.some(candidate => candidate.config.component === dependencyComponent))
      })
      console.log('packageNames', [...packageNames, ...additionalPackageNames])
      return [...packageNames, ...additionalPackageNames]
    }
    
    // create a proper new candidate
    const originalNewCandidate = (workspacePlugin as any).newCandidate.bind(workspacePlugin)
    const originalUpdateCandidate = (workspacePlugin as any).updateCandidate.bind(workspacePlugin)
    ;(workspacePlugin as any).newCandidate = (pkg: any, updatedVersions: Map<string, Version>): CandidateReleasePullRequest => {
      const originalCandidate = originalNewCandidate(pkg, updatedVersions)
      if (this.releasePullRequestsByPath[originalCandidate.path]) {
        const candidate = {
          path: originalCandidate.path,
          pullRequest: this.releasePullRequestsByPath[originalCandidate.path],
          config: this.repositoryConfig[originalCandidate.path]
        }
        return originalUpdateCandidate(candidate, pkg, updatedVersions)
      } else {
        // some plugins (e.g. maven) tries to update not listed dependencies, so we will have to skip them
        originalCandidate.pullRequest.labels = ['skip-release']
        return originalCandidate
      }
    }

    return workspacePlugin
  }

  protected patchChangelogs(candidateReleasePullRequests: CandidateReleasePullRequest[]): CandidateReleasePullRequest[] {
    const patchChangelogUpdate = (update: Omit<PatchedChangelogUpdate, 'sections'> & Partial<Pick<PatchedChangelogUpdate, 'sections'>>): PatchedChangelogUpdate => {
      if (!update.sections) {
        const [header] = update.updater.changelogEntry.match(/^##[^#]+/) ?? []
        update.sections = Array.from(update.updater.changelogEntry.matchAll(/###.+?(?=###|$)/gs), ([section]) => {
          if (section.startsWith('### Dependencies\n\n')) {
            const bumps = Array.from(section.matchAll(/\* (?<packageName>\S+) bumped (?:from (?<from>[\d\.]+) )?to (?<to>[\d\.]+)/gm), match => match.groups! as Omit<Bump, 'sections'>)
            update.bumps = bumps.reduce((bumps, bump) => {
              if (bumps.every(existedBump => bump.packageName !== existedBump.packageName)) {
                const bumpedCandidate = candidateReleasePullRequests.find(candidate => candidate.path === this.pathsByPackagesName[bump.packageName])
                const bumpedChangelogUpdate = bumpedCandidate?.pullRequest.updates.find(update => update.updater instanceof Changelog)
                if (bumpedChangelogUpdate) {
                  const patchedBumpedChangelogUpdate = patchChangelogUpdate(bumpedChangelogUpdate as Update & {updater: Changelog})
                  bumps.push(
                    {...bump, sections: patchedBumpedChangelogUpdate.sections.filter(section => !section.startsWith('### Dependencies\n\n'))},
                    ...(patchedBumpedChangelogUpdate.bumps?.filter(bump => bumps.every(existedBump => bump.packageName !== existedBump.packageName)) ?? [])
                  )
                } else {
                  bumps.push({...bump, sections: []})
                }
              }
              return bumps
            }, [] as Bump[])
            const dependencies = update.bumps
              .sort((bump1, bump2) => (bump1.sections.length > 0 ? 1 : 0) > (bump2.sections.length > 0 ? 1 : 0) ? -1 : 1)
              .map(bump => {
                const header = `* ${bump.packageName} bumped ${bump.from ? `from ${bump.from} ` : ''}to ${bump.to}\n`
                if (!bump.sections) return header
                return `${header}${bump.sections.map(section => `  #${section.replace(/(\n+)([^\n])/g, '$1  $2')}`).join('')}`
              })
            return `### Dependencies\n\n${dependencies.join('\n')}`
          }
          return section
        })
        update.updater.changelogEntry = `${header}${update.sections.join('')}`
      }
      return update as PatchedChangelogUpdate
    }

    for (const candidate of candidateReleasePullRequests) {
      const changelogUpdate = candidate.pullRequest.updates.find(update => update.updater instanceof Changelog) as Update & {updater: Changelog} | undefined
      if (changelogUpdate) {
        patchChangelogUpdate(changelogUpdate)
        candidate.pullRequest.body.releaseData[0].notes = changelogUpdate.updater.changelogEntry
      }
    }

    return candidateReleasePullRequests
  }
}
