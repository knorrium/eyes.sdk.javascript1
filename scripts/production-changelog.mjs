import {execSync} from 'child_process'

const internalChangelog = execSync(`gh release view '${process.argv[2]}' --json body --jq .body`, {encoding: 'utf8'})

const prodChangelog = `${extractChangelogHeader(internalChangelog)}\n\n${extractChangelogSections(internalChangelog)}`

console.log(prodChangelog)

function extractChangelogHeader(changelog) {
  const match = changelog.match(/^## \[(?<version>.+?)\]\((?<url>.+?)\) \((?<date>.+?)\)/)
  return `## ${match.groups.version} (${match.groups.date})`
}

function extractChangelogSections(changelog) {
  const sections = Array.from(changelog.matchAll(/(?<=[^#]|^)### (?<name>.+?(?=\n+))(?<items>.+?)(?=[^#]### |$)/gs))
    .flatMap(match => {
      if (match.groups.name === 'Dependencies') {
        return Array.from(match.groups.items.matchAll(/(?<=[^ ]|^)\* .+?(?=[^ ]\* |$)/gs)).flatMap(([item]) => {
          return Array.from(item.matchAll(/(?<=[^#]|^)#### (?<name>.+?(?=\n+))(?<items>.+?)(?=[^#]#### |$)/gs), match => match.groups)
        })
      }
      return match.groups
    })
    .reduce((sections, {name, items}) => {
      sections[name] = Array.from(new Set([
        ...(sections[name] ?? []),
        ...items.trim().split(/\n+/).map(item => item.replace(/^\s*\*\s/, '').replace(/\(.*\)$/, '').trim())
      ]))
      return sections
    }, {})

  return Object.entries(sections).map(([name, items]) => `### ${name}\n\n${items.map(item => `* ${item}`).join('\n')}`).join('\n\n')
}
