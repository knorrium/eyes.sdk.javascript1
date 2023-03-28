'use strict';

const fs = require('fs');
const {resolve} = require('path');
const {formatters} = require('@applitools/core');

function handleJsonFile(jsonFilePath, summary) {
  const path = resolve(jsonFilePath, 'eyes.json');
  fs.writeFileSync(path, formatters.toJsonOutput(summary));
  return path;
}

module.exports = handleJsonFile;
