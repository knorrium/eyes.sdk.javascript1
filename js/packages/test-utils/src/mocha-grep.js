function mochaGrep({grep = process.env.MOCHA_GREP, tags, mode = 'within'} = {}) {
  if (!tags) {
    if (process.env.MOCHA_TAGS) tags = process.env.MOCHA_TAGS.split(/[,\s]\s*/)
    else if (process.env.MOCHA_ONLY_TAGS) {
      tags = process.env.MOCHA_ONLY_TAGS.split(/[,\s]\s*/)
      mode = 'only'
    } else if (process.env.MOCHA_OMIT_TAGS) {
      tags = process.env.MOCHA_OMIT_TAGS.split(/[,\s]\s*/)
      mode = 'omit'
    }
  }

  if (!grep && !tags) return undefined

  let regexp = grep ? `.*?${grep}.*?` : `.*?`
  if (tags) {
    if (mode === 'within') regexp += `(\\(((${tags.map(tag => `@${tag}`).join('|')})\\s?)+\\))?[^()]*?`
    else if (mode === 'only') regexp += `\\(${tags.map(tag => `(?=.*@${tag})`)}.*?\\)[^()]*?`
    else if (mode === 'omit') regexp += `(\\((?!${tags.map(tag => `@${tag}`).join('|')}).*?\\))?[^()]*?`
  }

  return new RegExp(`^${regexp}$`, 'i')
}

module.exports = mochaGrep
