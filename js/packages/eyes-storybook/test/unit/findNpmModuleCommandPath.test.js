'use strict';
const {describe, it, after} = require('mocha');
const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const findNpmModuleCommandPath = require('../../src/findNpmModuleCommandPath');

describe('findNpmModuleCommandPath', function () {
  const binaryName = 'start-storybook';
  const isWindows = process.platform.startsWith('win');
  const relativeBinPath = path.join('node_modules', '.bin', binaryName + (isWindows ? '.cmd' : ''));

  it('should find the binary in local node_modules', async () => {
    const tempDir = path.join(path.resolve(__dirname), 'tmp-findLocal');

    createDir(tempDir);
    after(() => rmdirSync(tempDir));

    writeFile(path.join(tempDir, relativeBinPath), '');

    expect(await findNpmModuleCommandPath(binaryName, tempDir)).to.equal(
      path.join(tempDir, relativeBinPath),
    );
  });

  it('should find the binary in parent node_modules', async () => {
    const tempDir = path.join(path.resolve(__dirname), 'tmp-findParent');

    createDir(tempDir);
    after(() => rmdirSync(tempDir));

    writeFile(path.join(tempDir, relativeBinPath), '');

    const subProjectDir = path.join(tempDir, 'subProject');
    createDir(path.join(subProjectDir, 'node_modules', '.bin'));

    expect(await findNpmModuleCommandPath(binaryName, subProjectDir)).to.equal(
      path.join(tempDir, relativeBinPath),
    );
  });
});

/**
 * @param {string} dirPath
 */
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, {recursive: true});
}

/**
 * @param {string} dir
 */
function rmdirSync(dir) {
  if (fs.rmSync != null) fs.rmSync(dir, {recursive: true});
  else fs.rmdirSync(dir, {recursive: true});
}

/**
 * @param {string} filePath
 * @param {string} content
 */
function writeFile(filePath, content) {
  createDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}
