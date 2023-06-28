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
  workspace: 'node' | 'maven'
}

export class RichWorkspace extends ManifestPlugin {
  private index = -1
  protected plugin: WorkspacePlugin<unknown>
  protected strategiesByPath: Record<string, Strategy> = {}
  protected commitsByPath: Record<string, ConventionalCommit[]> = {}
  protected releasesByPath: Record<string, Release> = {}
  protected releasePullRequestsByPath: Record<string, ReleasePullRequest | undefined> = {}
  protected pathsByPackagesName: Record<string, string> = {}

  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    options: RichWorkspaceOptions
  ) {
    super(github, targetBranch, repositoryConfig, options.logger);
    const workspacePlugin = buildPlugin({
      ...options,
      type: {type: `${options.workspace}-workspace`, merge: false},
      github,
      targetBranch,
      repositoryConfig,
    }) as WorkspacePlugin<unknown>
    this.plugin = this.patchWorkspacePlugin(workspacePlugin)
  }

  async preconfigure(
    strategiesByPath: Record<string, Strategy>,
    commitsByPath: Record<string, Commit[]>,
    releasesByPath: Record<string, Release>
  ): Promise<Record<string, Strategy>> {
    this.strategiesByPath = strategiesByPath as Record<string, BaseStrategy>
    this.releasesByPath = releasesByPath
    this.pathsByPackagesName = await Object.entries(this.strategiesByPath).reduce(async (promise, [path, strategy]) => {
      const packageName = await (strategy as BaseStrategy).getPackageName()
      return promise.then(pathsByPackagesName => Object.assign(pathsByPackagesName, packageName ? {[packageName]: path} : {}))
    }, Promise.resolve({} as Record<string, string>))
    return this.plugin.preconfigure(strategiesByPath, commitsByPath, releasesByPath)
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.index += 1
    this.commitsByPath[Object.keys(this.strategiesByPath)[this.index]] = commits
    return this.plugin.processCommits(commits)
  }

  async run(candidates: CandidateReleasePullRequest[]) {
    const updateDepsCommit = {
      sha: '',
      message: 'deps: update some dependencies',
      files: [],
      pullRequest: undefined,
      type: 'deps',
      scope: undefined,
      bareMessage: 'update some dependencies',
      notes: [],
      references: [],
      breaking: false
    }
    this.releasePullRequestsByPath = await Object.entries(this.strategiesByPath).reduce(async (promise, [path, strategy]) => {
      const releasePullRequest = 
        candidates.find(candidate => candidate.path === path)?.pullRequest ??
        await strategy.buildReleasePullRequest([...this.commitsByPath[path], updateDepsCommit], this.releasesByPath[path])
      return promise.then(releasePullRequestsByPath => {
        releasePullRequestsByPath[path] = releasePullRequest
        return releasePullRequestsByPath
      })
    }, Promise.resolve({} as Record<string, ReleasePullRequest | undefined>))
    const updatedCandidates = await this.plugin.run(candidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release')))

    this.patchChangelogs(updatedCandidates)

    return updatedCandidates.filter(candidate => !candidate.pullRequest.labels.includes('skip-release'))
  }

  protected patchWorkspacePlugin(workspacePlugin: WorkspacePlugin<unknown>): WorkspacePlugin<unknown> {
    // const originalPackageNamesToUpdate = (workspacePlugin as any).packageNamesToUpdate.bind(workspacePlugin)
    // ;(workspacePlugin as any).packageNamesToUpdate = (
    //   graph: DependencyGraph<unknown>,
    //   candidatesByPackage: Record<string, CandidateReleasePullRequest>
    // ): string[] => {
    //   return originalPackageNamesToUpdate(
    //     graph,
    //     Object.fromEntries(Object.entries(candidatesByPackage).filter(([, candidate]) => !candidate.pullRequest.labels.includes('skip-release'))),
    //   )
    // }

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
    
    const originalNewCandidate = (workspacePlugin as any).newCandidate.bind(workspacePlugin)
    const originalUpdateCandidate = (workspacePlugin as any).updateCandidate.bind(workspacePlugin)
    ;(workspacePlugin as any).newCandidate = (pkg: any, updatedVersions: Map<string, Version>): CandidateReleasePullRequest => {
      const {path} = originalNewCandidate(pkg, updatedVersions)
      const candidateReleasePullRequest = {
        path,
        pullRequest: this.releasePullRequestsByPath[path]!,
        config: this.repositoryConfig[path]
      }
      return originalUpdateCandidate(candidateReleasePullRequest, pkg, updatedVersions)
    }

    return workspacePlugin
  }

  protected patchChangelogs(candidateReleasePullRequests: CandidateReleasePullRequest[]): CandidateReleasePullRequest[] {
    const patchChangelogUpdate = (update: Omit<PatchedChangelogUpdate, 'sections'> & Partial<Pick<PatchedChangelogUpdate, 'sections'>>): PatchedChangelogUpdate => {
      if (!update.sections) {
        console.log('-------', update.updater.changelogEntry)
        const [header] = update.updater.changelogEntry.match(/^##[^#]+/) ?? []
        update.sections = Array.from(update.updater.changelogEntry.matchAll(/###.+?(?=###|$)/gs), ([section]) => {
          console.log('++++', section)
          if (section.startsWith('### Dependencies\n\n')) {
            const bumps = Array.from(section.matchAll(/\* (?<packageName>\S+) bumped from (?<from>[\d\.]+) to (?<to>[\d\.]+)/gm), match => match.groups! as Omit<Bump, 'sections'>)
            update.bumps = bumps.reduce((bumps, bump) => {
              const bumpedCandidate = candidateReleasePullRequests.find(candidate => candidate.path === this.pathsByPackagesName[bump.packageName])
              const bumpedChangelogUpdate = bumpedCandidate?.pullRequest.updates.find(update => update.updater instanceof Changelog)
              if (bumpedChangelogUpdate) {
                const patchedBumpedChangelogUpdate = patchChangelogUpdate(bumpedChangelogUpdate as Update & {updater: Changelog})
                bumps.push({...bump, sections: patchedBumpedChangelogUpdate.sections.filter(section => !section.startsWith('### Dependencies\n\n'))})
                patchedBumpedChangelogUpdate.bumps?.forEach(bump => {
                  const existedBumpIndex = bumps.findIndex(existedBump => existedBump.packageName === bump.packageName)
                  if (existedBumpIndex === -1) bumps.push(bump)
                  else {
                    const bumpFrom = bump.from.split('.')
                    const existedBumpFrom = bumps[existedBumpIndex].from.split('.')
                    if (bumpFrom.some((version, index) => Number(version) < Number(existedBumpFrom[index]))) bumps[existedBumpIndex] = bump
                  }
                })

              } else {
                bumps.push({...bump, sections: []})
              }
              return bumps
            }, [] as Bump[])
            const dependencies = update.bumps.map(bump => {
              const header = `* ${bump.packageName} bumped from ${bump.from} to ${bump.to}\n`
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
