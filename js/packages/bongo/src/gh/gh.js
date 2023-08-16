const utils = require('@applitools/utils')

async function getTagPackages() {
  return [
    `js/core`,
    `js/eyes`,
    `js/eyes-images`,
    `js/eyes-webdriverio`,
    'js/eyes-selenium',
    'js/eyes-nightwatch',
    'js/eyes-playwright',
    'js/eyes-puppeteer',
    'js/eyes-browser-extension',
    'js/eyes-storybook',
    'js/eyes-cypress',

    'java/eyes-images-java5',
    'java/eyes-selenium-java5',
    'java/eyes-appium-java5',
    'java/eyes-playwright-java5',

    'python/eyes-images',
    'python/eyes-selenium',
    'python/eyes-robotframework',
    'python/eyes-playwright',
  ]
}

async function getReleaseNotes({repo, tag}) {
  const result = await utils.process.execute(`gh release view "${tag}" --repo ${repo} --json body --jq .body`)
  return result.stdout
}

async function getReleases({repo, limit = 10}) {
  const tagPackages = await getTagPackages({repo})
  const result = await utils.process.execute(`gh release list --repo ${repo} --limit ${limit}`)
  return result.stdout
    .trim()
    .split('\n')
    .reduce((packages, release) => {
      const [_name, _type, tag, createdAt] = release.split('\t')
      const [package, version] = tag.split('@')
      if (tagPackages.includes(package)) {
        if (!packages[package]) packages[package] = []
        packages[package].push({version, tag, createdAt: new Date(createdAt)})
      }
      return packages
    }, {})
}

module.exports = {getTagPackages, getReleaseNotes, getReleases}
