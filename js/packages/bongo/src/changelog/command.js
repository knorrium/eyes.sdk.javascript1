const fs = require('fs')
const utils = require('@applitools/utils')
const chalk = require('chalk')
const ms = require('ms')
const msee = require('msee')
const {getReleases, getReleaseNotes} = require('../gh/gh')

exports.command = 'changelog'
exports.description = 'Provides a production changelog for a specific package an version'
exports.builder = yargs =>
  yargs.options({
    tag: {
      type: 'string',
      description: 'release tag of the package',
    },
    package: {
      type: 'string',
      description: 'name of the package',
    },
    since: {
      type: 'string',
      description: 'generate changelog for a time period started since date',
      coerce: since => (since.endsWith(' ago') ? Date.now() - ms(since.slice(0, -4)) : Date.parse(since)),
    },
    file: {
      type: 'string',
      description: 'file to save changelog',
      coerce: file => (file === '' ? true : file),
    },
    capitalize: {
      type: 'boolean',
      description: 'wether to capitalize the log lines',
      default: true,
    },
    edit: {
      type: 'boolean',
      descriptions: 'wether you want to edit changelog before output',
    },
  })
exports.handler = async options => {
  if (!options.repo) options.repo = 'https://github.com/applitools/eyes.sdk.javascript1'
  const {default: ora} = await import('ora')
  const {default: inquirer} = await import('inquirer')
  const {default: DatePrompt} = await import('inquirer-date-prompt')
  inquirer.registerPrompt('date', DatePrompt)

  const interactive = !options.tag
  if (interactive) {
    const formatter = Intl.DateTimeFormat('en', {dateStyle: 'long'})
    const releasesPromise = getReleases({...options, limit: 500})

    options = await inquirer.prompt(
      [
        {
          type: 'confirm',
          name: 'shouldInputDate',
          prefix: '❓',
          message: 'Do you want to choose a date?',
          when: ({since}) => !since,
        },
        {
          type: 'date',
          name: 'since',
          prefix: '🗓️ ',
          message: 'Choose a date:',
          when: ({shouldInputDate}) => shouldInputDate,
          locale: 'en-US',
          format: {month: 'short', year: undefined, hour: undefined, minute: undefined},
        },
        {
          type: 'list',
          name: 'package',
          prefix: '📦',
          message: 'Choose a package:',
          pageSize: 10,
          choices: async ({since}) => {
            const releases = await releasesPromise
            const choices = Object.entries(releases)
              .filter(([_, release]) => !since || release.some(({createdAt}) => Date.parse(createdAt) >= since))
              .map(([name, release]) => ({
                name: `${name} ${chalk.grey(`(latest ${formatter.format(release[0].createdAt)})`)}`,
                value: name,
              }))
            if (choices.length > 0 && since) choices.unshift({name: chalk.bold(`All packages`), value: 'all'})
            return choices
          },
        },
        {
          type: 'list',
          name: 'tag',
          prefix: '🔥',
          message: 'Choose a version:',
          pageSize: 10,
          when: ({since}) => !since,
          choices: async ({since, package}) => {
            const releases = await releasesPromise
            return releases[package]
              .filter(({createdAt}) => !since || Date.parse(createdAt) >= since)
              .map(({version, tag, createdAt}) => ({
                name: `${version} ${chalk.grey(`(${formatter.format(createdAt)})`)}`,
                value: tag,
              }))
          },
        },
      ],
      options,
    )

    if (!options.tag && options.package) {
      const releases = await releasesPromise
      options.tag = (options.package === 'all' ? Object.values(releases).flat() : releases[options.package])
        .filter(({createdAt}) => !options.since || Date.parse(createdAt) >= options.since)
        .map(({tag}) => tag)
    }
  }

  const spinner = ora(chalk.bold(' Generating changelog')).start()
  const changelog = await extractSimplifiedChangelog(options).finally(() => spinner.stop())

  if (options.edit) {
    const items = Object.entries(changelog).reduce((result, [package, releases]) => {
      Object.entries(releases).forEach(([version, {header, sections}]) => {
        Object.entries(sections).forEach(([section, items]) => {
          items.forEach((item, index) => {
            result[item] ??= []
            result[item].push({package, version, section, index, date: header.date})
          })
        })
      })
      return result
    }, {})
    console.log(chalk.bold(`🪶  Edit changelog lines`), chalk.grey(`(to keep as is press ↵ Enter)`), '\n')
    for (const [item, info] of Object.entries(items)) {
      const {value} = await inquirer.prompt({
        type: 'input',
        name: 'value',
        prefix: '',
        message: `${item} ${chalk.grey(`(appeared at ${info.map(info => info.package).join(', ')})`)}:`,
        default: item,
      })
      info.forEach(({package, version, section, index}) => {
        changelog[package][version].sections[section][index] = value
      })
    }
  }

  const formattedChangelog = formatChangelog(changelog)

  if (options.file) {
    if (options.file === true) {
      options.file = `./${options.since ? options.package.replace('/', '-') : options.tag.replace('/', '-')}.md`
    }
    fs.writeFileSync(options.file, formattedChangelog)
    console.log(chalk.bold('✅ Changelog saved to the file:'), chalk.cyan(options.file))
  } else {
    console.log(msee.parse(formattedChangelog))
  }
}

async function extractSimplifiedChangelog({tag, repo, capitalize}) {
  const tags = utils.types.isArray(tag) ? tag : [tag]
  const groups = tags.reduce((groups, tag) => {
    const name = tag.split('@', 1)[0]
    let group = groups.get(name)
    if (!group) groups.set(name, (group = []))
    group.push(tag)
    return groups
  }, new Map())

  return Array.from(groups.entries()).reduce(async (promise, [name, tags]) => {
    const versions = await tags.reduce(async (promise, tag) => {
      const notes = await getReleaseNotes({tag, repo})
      return promise.then(versions => {
        const header = extractChangelogHeader(notes)
        versions[header.version] = {header, sections: extractChangelogSections(notes, {capitalize})}
        return versions
      })
    }, Promise.resolve({}))
    return promise.then(changelog => {
      changelog[name] = versions
      return changelog
    })
  }, Promise.resolve({}))
}

function extractChangelogHeader(changelog) {
  const match = changelog.match(/^## \[?(?<version>.+?)\]?(?:\((?<url>.+?)\))? \((?<date>.+?)\)/)
  return {version: match.groups.version, date: match.groups.date}
}

function extractChangelogSections(changelog, {capitalize = false} = {}) {
  return Array.from(changelog.matchAll(/(?<=[^#]|^)### (?<name>.+?(?=\n+))(?<items>.+?)(?=[^#]### |$)/gs))
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
            .map(item => {
              item = item
                .replace(/^\s*\*\s/, '')
                .replace(/\(.*\)$/, '')
                .trim()
              if (capitalize) item = item[0].toUpperCase() + item.substring(1)
              return item
            }),
        ]),
      )
      return sections
    }, {})
}

function formatChangelog(changelog) {
  return Object.entries(changelog).reduce((changelog, [package, releases], _index, {length}) => {
    if (length > 1) changelog += `# ${package}\n\n`
    Object.values(releases).forEach(({header, sections}) => {
      changelog += `## ${header.version} (${header.date})\n\n`
      changelog += Object.entries(sections)
        .map(([name, items]) => `### ${name}\n\n${items.map(item => `* ${item}`).join('\n')}`)
        .join('\n\n')
      changelog += '\n\n'
    })
    return changelog
  }, '')
}
