'use strict';

const fs = require('fs');
const {resolve} = require('path');
const {formatters} = require('@applitools/core');

function handleXmlFile(xmlFilePath, summary, {suiteName = 'Eyes Storybook', totalTime} = {}) {
  const path = resolve(xmlFilePath, 'eyes.xml');
  fs.writeFileSync(
    path,
    formatters.toXmlOutput(
      summary.results.map(({result}) => result),
      {suiteName, totalTime},
    ),
  );
  return path;
}

module.exports = handleXmlFile;
