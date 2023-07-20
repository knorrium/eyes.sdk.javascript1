const {execSync} = require('child_process')

async function getReleaseNotes({repo, tag}) {
  return execSync(`gh release view "${tag}" --repo ${repo} --json body --jq .body`, {encoding: 'utf8'})
}

async function getReleases({repo, limit}) {
  const releases = execSync(`gh release list --repo ${repo} --limit ${limit}`, {encoding: 'utf-8'})
  return releases
    .trim()
    .split('\n')
    .reduce((packages, release) => {
      const [_name, _type, tag, createdAt] = release.split('\t')
      const [package, version] = tag.split('@')
      if (!packages[package]) packages[package] = []
      packages[package].push({version, tag, createdAt})
      return packages
    }, {})
}

module.exports = {getReleaseNotes, getReleases}
