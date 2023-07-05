const fs = require('fs');
const path = require('path');

/**
 * Find the path to the given npm command.
 * It goes recursively up the directory tree until it finds the command, like npm itself does.
 * @param {string} npmModuleCommand - The npm command to find.
 * @param {string} packageJsonDirPath - the directory in which to start searching for the command.
 * @returns {Promise<string|null>} The path to the command.
 */
module.exports = async function findNpmModuleCommandPath(npmModuleCommand, packageJsonDirPath) {
  const isWindows = process.platform.startsWith('win');

  let checkRootPath = path.resolve(packageJsonDirPath);
  while (checkRootPath !== '') {
    const commandPath = path.join(
      checkRootPath,
      'node_modules',
      '.bin',
      npmModuleCommand + (isWindows ? '.cmd' : ''),
    );
    if (await doesFileExist(commandPath)) return commandPath;

    const nextPath = path.dirname(checkRootPath);
    if (nextPath === checkRootPath) break; // the top of the file tree is reached

    checkRootPath = nextPath;
  }

  return null;
};

/**
 * Check whether a file exists asynchronously.
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
function doesFileExist(filePath) {
  return new Promise(resolve => {
    fs.stat(filePath, (err, stats) => {
      if (err) resolve(false);
      else if (stats != null && stats.isFile()) resolve(true);
      else resolve(false);
    });
  });
}
