function extractEnvironment() {
  const versions = {};
  try {
    const {name, version} = require('storybook/package.json');
    versions[name] = version;
  } catch {
    // NOTE: ignore error
  }
  return {versions};
}

module.exports = {extractEnvironment};
