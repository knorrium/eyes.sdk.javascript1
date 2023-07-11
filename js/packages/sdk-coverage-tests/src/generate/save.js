const fs = require('fs')
const path = require('path')
const prettier = require('prettier')

async function createTestFiles(tests, {outDir, ext, format}) {
  const targetDirectory = path.join(process.cwd(), outDir)

  if (process.version.startsWith('v12')) fs.rmdirSync(targetDirectory, {recursive: true})
  else fs.rmSync(targetDirectory, {force: true, recursive: true})
  fs.mkdirSync(targetDirectory, {recursive: true})

  tests.forEach(test => {
    const filePath = path.resolve(targetDirectory, `${test.key}${ext}`)
    fs.writeFileSync(filePath, format ? prettier.format(test.code, format) : test.code)
  })
}

async function createTestMetaData(tests, {metaDir = '', pascalizeTests = true} = {}) {
  const targetDirectory = path.resolve(process.cwd(), metaDir)
  fs.mkdirSync(targetDirectory, {recursive: true})

  const meta = tests.reduce((meta, test) => {
    const data = {
      isGeneric: true,
      name: test.group,
      variant: test.variant,
      skip: test.skip,
      skipEmit: test.skipEmit,
    }
    meta[pascalizeTests ? test.key : test.name] = data
    return meta
  }, {})

  const filePath = path.resolve(targetDirectory, 'meta.json')
  fs.writeFileSync(filePath, JSON.stringify(meta, null, 2))
}

exports.createTestFiles = createTestFiles
exports.createTestMetaData = createTestMetaData
