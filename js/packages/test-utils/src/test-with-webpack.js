/* eslint-disable no-console */
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const {Volume} = require('memfs')
const {Union} = require('unionfs')

async function testWithWebpack({cwd = process.cwd()} = {}) {
  const {name} = require(path.resolve(cwd, './package.json'))
  const memfs = Volume.fromJSON(
    {
      './main.js': `import defaultExport, * as namedExport from '${name}'`,
    },
    cwd,
  )
  const unionfs = new Union().use(fs).use(memfs)

  const compiler = webpack({mode: 'production', context: cwd, entry: './main.js'})
  compiler.inputFileSystem = unionfs
  compiler.intermediateFileSystem = unionfs
  compiler.outputFileSystem = memfs
  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) return reject(error)
      const data = stats.toJson()
      if (data.errorsCount > 0) {
        console.error(stats.toString())
        return reject(data.errors[0])
      }
      return resolve(stats)
    })
  })
}

module.exports = testWithWebpack
