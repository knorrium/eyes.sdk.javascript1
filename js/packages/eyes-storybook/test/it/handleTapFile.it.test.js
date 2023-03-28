const fs = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');
const {describe, it} = require('mocha');
const {expect} = require('chai');
const handleTapFile = require('../../src/handleTapFile');
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

describe('handleTapFile', () => {
  it('works', async () => {
    let path;
    try {
      path = handleTapFile(__dirname, {results: [{name: 'test', isNew: true}]});
      expect(path).to.be.equal(resolve(__dirname, 'eyes.tap'));
      const content = await readFile(resolve(__dirname, 'eyes.tap'), 'utf8');
      expect(content).to.be.equal(`1..1
ok 1 - [PASSED TEST] Test: 'test', Application: 'undefined'
#	Test url: No URL (session didn't start).
#	Browser: undefined, Viewport: undefined
`);
    } finally {
      path && (await unlink(path));
    }
  });
});
