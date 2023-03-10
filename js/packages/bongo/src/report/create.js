const {convertJunitXmlToResultSchema} = require('./xml')

function createReport({reportId, name, junit, metadata, sandbox = false}) {
  return {
    id: reportId,
    sdk: name,
    group: name === 'core' ? 'core' : 'selenium',
    results: convertJunitXmlToResultSchema({junit, metadata}),
    sandbox,
  }
}

module.exports = {createReport}
