const fs = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');
const {describe, it} = require('mocha');
const {expect} = require('chai');
const handleXmlFile = require('../../src/handleXmlFile');
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

describe('handleXmlFile', () => {
  it('works', async () => {
    let path;
    try {
      path = handleXmlFile(__dirname, {results: [{name: 'test', isNew: true}]});
      expect(path).to.be.equal(resolve(__dirname, 'eyes.xml'));
      const content = await readFile(resolve(__dirname, 'eyes.xml'), 'utf8');
      expect(content).to.be.equal(`<?xml version="1.0" encoding="UTF-8" ?>
<testsuite name="Eyes Test Suite" tests="1" time="undefined">
<testcase name="test">
</testcase>
</testsuite>`);
    } finally {
      path && (await unlink(path));
    }
  });
});
