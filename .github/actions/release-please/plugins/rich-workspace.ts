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

type PatchedChangelogUpdate = Update & {updater: Changelog, sections: string[], bumps?: Record<string, any>[]}

export interface RichWorkspaceOptions extends WorkspacePluginOptions {
  manifestPath: string;
  workspace: 'node' | 'maven'
}

export class RichWorkspace extends ManifestPlugin {
  private index = -1
  protected plugin: WorkspacePlugin<unknown>
  protected strategiesByPath: Record<string, Strategy> = {}
  protected strategiesByPackageName: Record<string, Strategy> = {}
  protected commitsByPath: Record<string, ConventionalCommit[]> = {}
  protected releasesByPath: Record<string, Release> = {}
  protected releasePullRequestsByPath: Record<string, ReleasePullRequest | undefined> = {}

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
    this.strategiesByPath = strategiesByPath
    this.strategiesByPackageName = await Object.values(strategiesByPath).reduce(async (promise, strategy) => {
      const packageName = await (strategy as BaseStrategy).getPackageName()
      return promise.then(strategiesByPackageName => Object.assign(strategiesByPackageName, packageName ? {[packageName]: strategy} : {}))
    }, Promise.resolve({} as Record<string, Strategy>))
    this.releasesByPath = releasesByPath
    return this.plugin.preconfigure(strategiesByPath, commitsByPath, releasesByPath)
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.index += 1
    this.commitsByPath[Object.keys(this.strategiesByPath)[this.index]] = commits
    return this.plugin.processCommits(commits)
  }

  async run(candidateReleasePullRequest: CandidateReleasePullRequest[]) {
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
        candidateReleasePullRequest.find(candidateReleasePullRequest => candidateReleasePullRequest.path === path)?.pullRequest ??
        await strategy.buildReleasePullRequest([...this.commitsByPath[path], updateDepsCommit], this.releasesByPath[path])
      return promise.then(releasePullRequestsByPath => {
        releasePullRequestsByPath[path] = releasePullRequest
        return releasePullRequestsByPath
      })
    }, Promise.resolve({} as Record<string, ReleasePullRequest | undefined>))
    const updatedCandidateReleasePullRequests = await this.plugin.run(candidateReleasePullRequest)

    this.patchChangelogs(updatedCandidateReleasePullRequests)

    return updatedCandidateReleasePullRequests.filter(candidatePullRequest => {
      return !candidatePullRequest.pullRequest.labels.some(label => label === 'skip-release')
    })
  }

  protected patchWorkspacePlugin(workspacePlugin: WorkspacePlugin<unknown>): WorkspacePlugin<unknown> {
    const originalBuildGraph = (workspacePlugin as any).buildGraph.bind(workspacePlugin)
    ;(workspacePlugin as any).buildGraph = async (pkgs: unknown[]): Promise<DependencyGraph<any>> => {
      const graph = await originalBuildGraph(pkgs)
      for (const packageName of graph.keys()) {
        let packageStrategy = this.strategiesByPackageName[packageName] as BaseStrategy | undefined
        if (packageStrategy?.extraLabels.includes('skip-release')) {
          graph.delete(packageName)
        }
      }
      return graph
    }
    
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
    for (const candidate of candidateReleasePullRequests) {
      console.log('CONFIG', candidate.config)
      const changelogUpdate = candidate.pullRequest.updates.find(update => update.updater instanceof Changelog)
      if (changelogUpdate) patchChangelogUpdate(changelogUpdate as Update & {updater: Changelog})
      console.log('\n\n\n\n', candidate.path, (changelogUpdate as Update & {updater: Changelog} | undefined)?.updater.changelogEntry)
    }

    return candidateReleasePullRequests

    function patchChangelogUpdate(update: Omit<PatchedChangelogUpdate, 'sections'> & Partial<Pick<PatchedChangelogUpdate, 'sections'>>): PatchedChangelogUpdate {
      if (!update.sections) {
        const [header] = update.updater.changelogEntry.match(/^##[^#]+/) ?? []
        update.sections = Array.from(update.updater.changelogEntry.matchAll(/^###[^#]+/gm), ([section]) => {
          if (section.startsWith('### Dependencies\n\n')) {
            update.bumps = Array.from(section.matchAll(/\* (?<packageName>\S+) bumped from (?<from>[\d\.]+) to (?<to>[\d\.]+)/gm), match => match.groups!)
            const dependencies = update.bumps.flatMap(bump => {
              const header = `* ${bump.packageName} bumped from ${bump.from} to ${bump.to}\n`
              console.log(bump)
              const bumpedCandidate = candidateReleasePullRequests.find(candidate => candidate.config.packageName === bump.packageName)
              console.log(!!bumpedCandidate)
              const bumpedChangelogUpdate = bumpedCandidate?.pullRequest.updates.find(update => update.updater instanceof Changelog)
              if (!bumpedChangelogUpdate) return header
              const patchedBumpedChangelogUpdate = patchChangelogUpdate(bumpedChangelogUpdate as Update & {updater: Changelog})
              return `${header}${patchedBumpedChangelogUpdate.sections.map(section => `  #${section.replace('\n', '\n  ')}`)}`
            })
            return `### Dependencies\n\n${dependencies.join('\n')}`
          }
          return section
        })
        update.updater.changelogEntry = `${header}${update.sections.join('')}`
      }
      return update as PatchedChangelogUpdate
    }
  }
}
