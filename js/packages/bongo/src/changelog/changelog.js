const {getReleaseNotes} = require('../gh/gh')
const utils = require('@applitools/utils')

async function extractSimplifiedChangelog({tag, repo}) {
  const tags = utils.types.isArray(tag) ? tag : [tag]
  const entries = await tags.reduce(async (promise, tag) => {
    const notes = await getReleaseNotes({tag, repo})
    return promise.then(entries =>
      entries.concat(`${extractChangelogHeader(notes)}\n\n${extractChangelogSections(notes)}`),
    )
  }, Promise.resolve([]))
  return entries.join('\n\n')
}

function extractChangelogHeader(changelog) {
  const match = changelog.match(/^## \[(?<version>.+?)\]\((?<url>.+?)\) \((?<date>.+?)\)/)
  return `## ${match.groups.version} (${match.groups.date})`
}

function extractChangelogSections(changelog) {
  const sections = Array.from(changelog.matchAll(/(?<=[^#]|^)### (?<name>.+?(?=\n+))(?<items>.+?)(?=[^#]### |$)/gs))
    .flatMap(match => {
      if (match.groups.name === 'Dependencies') {
        return Array.from(match.groups.items.matchAll(/(?<=[^ ]|^)\* .+?(?=[^ ]\* |$)/gs)).flatMap(([item]) => {
          return Array.from(
            item.matchAll(/(?<=[^#]|^)#### (?<name>.+?(?=\n+))(?<items>.+?)(?=[^#]#### |$)/gs),
            match => match.groups,
          )
        })
      }
      return match.groups
    })
    .reduce((sections, {name, items}) => {
      sections[name] = Array.from(
        new Set([
          ...(sections[name] ?? []),
          ...items
            .trim()
            .split(/\n+/)
            .map(item =>
              item
                .replace(/^\s*\*\s/, '')
                .replace(/\(.*\)$/, '')
                .trim(),
            ),
        ]),
      )
      return sections
    }, {})

  return Object.entries(sections)
    .map(([name, items]) => `### ${name}\n\n${items.map(item => `* ${item}`).join('\n')}`)
    .join('\n\n')
}

module.exports = {extractSimplifiedChangelog}
