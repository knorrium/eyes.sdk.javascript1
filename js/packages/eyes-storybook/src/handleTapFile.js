'use strict';

const fs = require('fs');
const {resolve} = require('path');
const {formatters} = require('@applitools/core');

function handleTapFile(tapFilePath, summary) {
  const path = resolve(tapFilePath, 'eyes.tap');
  fs.writeFileSync(
    path,
    formatters.toHierarchicTAPString(
      summary.results.map(({result}) => result),
      {
        includeSubTests: false,
        markNewAsPassed: true,
      },
    ),
  );
  return path;
}

module.exports = handleTapFile;
