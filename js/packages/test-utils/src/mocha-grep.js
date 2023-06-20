function mochaGrep(options = {}) {
  if (!options.grep && process.env.MOCHA_GREP) options.grep = process.env.MOCHA_GREP

  if (!options.tags && process.env.MOCHA_TAGS) {
    options.tags = process.env.MOCHA_TAGS.split(/[,\s]\s*/)
  } else {
    options.tags = options.tags || {}
    if (!options.tags.include && process.env.MOCHA_INCLUDE_TAGS) {
      options.tags.include = process.env.MOCHA_INCLUDE_TAGS.split(/[,\s]\s*/)
    }
    if (!options.tags.exclude && process.env.MOCHA_EXCLUDE_TAGS) {
      options.tags.exclude = process.env.MOCHA_EXCLUDE_TAGS.split(/[,\s]\s*/)
    }
  }

  return {
    test(test) {
      if (options.grep && !new RegExp(options.grep, 'i').test(test)) return false
      if (options.tags) {
        const match = test.match(/(?<=\()(?:@[^()\s@]+ ?)+(?=\))/)
        const tags = match ? match[0].split(' ').map(tag => tag.slice(1)) : []
        if (Array.isArray(options.tags) && !tags.every(tag => options.tags.includes(tag))) return false
        else {
          if (options.tags.include && options.tags.include.some(tag => !tags.includes(tag))) return false
          if (options.tags.exclude && options.tags.exclude.some(tag => tags.includes(tag))) return false
        }
      }
      return true
    },
  }
}

module.exports = mochaGrep
