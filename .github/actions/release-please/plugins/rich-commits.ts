import {type GitHub} from 'release-please/build/src/github'
import {type Strategy} from 'release-please/build/src/strategy'
import {type BaseStrategy} from 'release-please/build/src/strategies/base'
import {type Commit, type ConventionalCommit} from 'release-please/build/src/commit'
import {type Release} from 'release-please/build/src/release'
import {type RepositoryConfig} from 'release-please/build/src/manifest'
import {type Logger} from 'release-please/build/src/util/logger'

import {ManifestPlugin} from 'release-please/build/src/plugin'

export interface RichCommitsOptions {
  'scope-groups': Record<string, string[]>
  logger?: Logger
}

export class RichCommits extends ManifestPlugin {
  private index = -1
  protected scopeGroups: Record<string, string[]>
  protected componentsByPath: Record<string, string> = {}
  protected strategiesByPath: Record<string, Strategy> = {}
  protected commitsByPath: Record<string, Commit[]> = {}
  protected releasesByPath: Record<string, Release> = {}

  constructor(
    github: GitHub,
    targetBranch: string,
    repositoryConfig: RepositoryConfig,
    options: RichCommitsOptions
  ) {
    super(github, targetBranch, repositoryConfig, options.logger);
    this.scopeGroups = options['scope-groups']
  }

  async preconfigure(
    strategiesByPath: Record<string, Strategy>,
    commitsByPath: Record<string, Commit[]>,
    releasesByPath: Record<string, Release>
  ): Promise<Record<string, Strategy>> {
    this.componentsByPath = await Object.entries(strategiesByPath).reduce(async (promise, [path, strategy]) => {
      const component = (await strategy.getComponent()) || ''
      return promise.then(componentsByPath => {
        componentsByPath[path] = component
        return componentsByPath
      })
    }, Promise.resolve({} as Record<string, string>))
    this.strategiesByPath = strategiesByPath
    this.commitsByPath = commitsByPath
    this.releasesByPath = releasesByPath
    return strategiesByPath
  }

  processCommits(commits: ConventionalCommit[]): ConventionalCommit[] {
    this.index += 1
    const component = this.componentsByPath[Object.keys(this.componentsByPath)[this.index]]
    const strategy = this.strategiesByPath[Object.keys(this.strategiesByPath)[this.index]] as BaseStrategy
    commits = this.addCommitNotes(commits)
    commits = this.filterRedundantCommits(commits, component)

    const skipReleaseCommit = commits.find(commit => commit.notes.some(note => note.title === 'SKIP RELEASE'))
    if (skipReleaseCommit) {
      const skipReleaseNote = [...skipReleaseCommit.notes].reverse().find(note => note.title === 'SKIP RELEASE')!
      if (skipReleaseNote.text === 'true') {
        strategy.extraLabels.push('skip-release')
      }
    }
    return commits
  }

  protected filterRedundantCommits(commits: ConventionalCommit[], component: string): ConventionalCommit[] {
    const matchScope = (scope: string) => {
      let invert = false
      if (scope.startsWith('!')) {
        invert = true
        scope = scope.slice(1)
      }
      let result: boolean
      if (scope.startsWith('#')) result = this.scopeGroups[scope.slice(1)]?.includes(component)
      else if (scope.startsWith('*')) result = component.endsWith(scope.slice(1))
      else if (scope.endsWith('*')) result = component.startsWith(scope.slice(0, -1))
      else result = component === scope
      return invert ? !result : result
    }
    
    // if empty commit has scope it should match the component in order to be attached to be applied
    return commits.reduce((commits, commit) => {
      if (commit.scope) {
        let scopes = commit.scope
        let operation: 'some' | 'every' = 'some'
        if (scopes.startsWith('| ')) {
          operation = 'some'
          scopes = scopes.slice(2)
        } else if (scopes.startsWith('& ')) {
          operation = 'every'
          scopes = scopes.slice(2)
        } else if (scopes.startsWith('!')) {
          operation = 'every'
        }
        if (scopes.split(/[,\s]+/g)[operation](matchScope)) commits.push({...commit, scope: null})
      } else {
        commits.push(commit)
      }
      return commits
    }, [] as ConventionalCommit[])
  }

  protected addCommitNotes(commits: ConventionalCommit[]): ConventionalCommit[] {
    // unknown footers are parsed as separate commits by release-please they has to be converted to notes
    return commits
      .reduceRight((commits, commit) => {
        if (commit.type.toLowerCase() === 'skip-release') {
          commits.at(-1)?.notes.push({
            title: 'SKIP RELEASE',
            text: commit.bareMessage
          })
        } else {
          commits.push(commit)
        }
        return commits
      }, [] as ConventionalCommit[])
      .reverse()
  }
}