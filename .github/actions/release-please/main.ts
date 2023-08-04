import {GitHub, Manifest, registerPlugin} from 'release-please'
import {PythonWorkspace} from './plugins/python-workspace'
import {RichWorkspace} from './plugins/rich-workspace'
import {RichCommits} from './plugins/rich-commits'
import * as core from '@actions/core'

registerPlugin(
  'python-workspace',
  options =>
    new PythonWorkspace(
      options.github,
      options.targetBranch,
      options.repositoryConfig,
      {...options, ...(options.type as any)}
    )
)

registerPlugin(
  'rich-commits',
  options =>
    new RichCommits(
      options.github,
      options.targetBranch,
      options.repositoryConfig,
    )
)

registerPlugin(
  'rich-workspace',
  options =>
    new RichWorkspace(
      options.github,
      options.targetBranch,
      options.repositoryConfig,
      {...options, ...(options.type as any)}
    )
)

main()
  .catch(err => {
    console.error(err)
    core.setFailed(err.message)
  })

async function main() {
  const configFile = core.getInput('config-file') || 'release-please-config.json'
  const manifestFile = core.getInput('manifest-file') || '.release-please-manifest.json'
  const github = await getGitHubInstance()
  let manifest = await Manifest.fromManifest(
    github,
    github.repository.defaultBranch,
    configFile,
    manifestFile,
    {fork: false}
  )

  outputReleases(await manifest.createReleases())
  manifest = await Manifest.fromManifest(
    github,
    github.repository.defaultBranch,
    configFile,
    manifestFile,
    {fork: false}
  )

  outputPRs(await manifest.createPullRequests())
}

function getGitHubInstance() {
  const token = core.getInput('token', { required: true })
  const defaultBranch = core.getInput('branch') || undefined
  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/')
  return GitHub.create({token, owner, repo, defaultBranch})
}

function outputReleases(releases: any[]) {
  releases = releases.filter(release => release !== undefined)
  const pathsReleased = [] as any[]
  if (releases.length) {
    core.setOutput('releases-created', true)
    for (const release of releases) {
      const path = release.path || '.'
      if (path) {
        pathsReleased.push(path)
        // If the special root release is set (representing project root)
        // and this is explicitly a manifest release, set the release_created boolean.
        core.setOutput(path === '.' ? 'release-created' : `${path}--release-created`, true)
      }
    }
  }
  // Paths of all releases that were created, so that they can be passed
  // to matrix in next step:
  core.setOutput('paths-released', JSON.stringify(pathsReleased))
}

function outputPRs(prs: any[]) {
  prs = prs.filter(pr => pr !== undefined)
  if (prs.length) {
    core.setOutput('pr', prs[0])
    core.setOutput('prs', JSON.stringify(prs))
  }
}
