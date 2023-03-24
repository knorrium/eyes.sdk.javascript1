const {convertJunitXmlToResultSchema} = require('./xml')

function createReport({reportId, name, group, junit, metadata, sandbox = false}) {
  return {
    id: reportId,
    sdk: name,
    group: group ? group : 'selenium',
    results: convertJunitXmlToResultSchema({junit, metadata}),
    sandbox,
  }
}

module.exports = {createReport}
