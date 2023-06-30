import {type Strategy} from 'release-please/build/src/strategy'
import {type BaseStrategy} from 'release-please/build/src/strategies/base'
import {type Commit, type ConventionalCommit} from 'release-please/build/src/commit'
import {type Release} from 'release-please/build/src/release'
import {ManifestPlugin} from 'release-please/build/src/plugin'

export class RichCommits extends ManifestPlugin {
  private index = -1
  protected componentsByPath: Record<string, string> = {}
  protected strategiesByPath: Record<string, Strategy> = {}
  protected commitsByPath: Record<string, Commit[]> = {}
  protected releasesByPath: Record<string, Release> = {}

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
    // if empty commit has scope it should contain component in order to be attached to the path
    return commits.reduce((commits, commit) => {
      if (commit.scope) {
        const matches = commit.scope.split(/[,\s]+/g).some(scope => {
          if (scope.startsWith('*')) return component.endsWith(scope.slice(1))
          else if (scope.endsWith('*')) return component.startsWith(scope.slice(0, -1))
          else return component === scope
        })
        if (matches) commits.push({...commit, scope: null})
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
