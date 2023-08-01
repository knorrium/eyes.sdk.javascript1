/* eslint-disable no-console */
function mochaGrep({grep = process.env.MOCHA_GREP, tags = {}} = {}) {
  if (!tags.allowed && process.env.MOCHA_ALLOW_TAGS) {
    tags.allow = process.env.MOCHA_ALLOW_TAGS.split(/[,\s]\s*/)
  }
  if (process.env.MOCHA_ONLY_TAGS) {
    tags.only = process.env.MOCHA_ONLY_TAGS.split(/[,\s]\s*/)
  }
  if (process.env.MOCHA_OMIT_TAGS) {
    tags.omit = process.env.MOCHA_OMIT_TAGS.split(/[,\s]\s*/)
  }

  if (tags.omit) {
    if (tags.allow) tags.allow = tags.allow.filter(tag => !tags.omit.includes(tag))
    if (tags.only) tags.only = tags.only.filter(tag => !tags.omit.includes(tag))
  }

  if (grep) return new RegExp(`^.*?${grep}.*?$`, 'i')

  if (tags.allow) {
    /* eslint-disable prettier/prettier */
    const regexp = tags.only
      ? `^(?:[^()]*?\\(${tags.only.map(tag => `(?=.*@${tag})`)}(?:(?:${tags.allow.map(tag => `@${tag}`).join('|')})\\s*)+\\)){1,4}$`
      : `^(?:[^()]*?(?:\\((?:(?:${tags.allow.map(tag => `@${tag}`).join('|')})\\s*)+\\))?){1,4}$`
    /* eslint-enable prettier/prettier */
    return new RegExp(regexp, 'i')
  } else if (tags.only) {
    const regexp = `^(?:[^()]*?\\(${tags.only.map(tag => `(?=.*@${tag})`)}.*\\)[^()]*?){1,4}$`
    return new RegExp(regexp, 'i')
  } else if (tags.omit) {
    const regexp = `^(?:[^()]*?(?:\\(${tags.omit.map(tag => `(?!.*@${tag})`)}.*\\))?){1,4}$`
    return new RegExp(regexp, 'i')
  }
}

module.exports = mochaGrep
