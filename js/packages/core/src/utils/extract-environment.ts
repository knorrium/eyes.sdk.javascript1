import * as os from 'os'

export function extractEnvironment(baseEnvironment?: Record<string, any>): Record<string, any> {
  return {
    ...baseEnvironment,
    versions: {
      ...baseEnvironment?.versions,
      core: require('../../package.json').version,
      node: process.version,
    },
    platform: `${os.type()}@${os.release()}`,
    arch: os.arch(),
    ram: os.totalmem(),
    ci: extractCIProvider(),
  }
}

export function extractCIProvider(): string | null {
  if (process.env.TF_BUILD) return 'Azure'
  else if (process.env['bamboo.buildKey']) return 'Bamboo'
  else if (process.env.BUILDKITE) return 'Buildkite'
  else if (process.env.CIRCLECI) return 'Circle'
  else if (process.env.CIRRUS_CI) return 'Cirrus'
  else if (process.env.CODEBUILD_BUILD_ID) return 'CodeBuild'
  else if (process.env.GITHUB_ACTIONS) return 'GitHub Actions'
  else if (process.env.GITLAB_CI) return 'GitLab'
  else if (process.env.HEROKU_TEST_RUN_ID) return 'Heroku'
  else if (process.env.BUILD_ID) return 'Jenkins'
  else if (process.env.TEAMCITY_VERSION) return 'TeamCity'
  else if (process.env.TRAVIS) return 'Travis'
  return null
}
