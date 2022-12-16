const {describe, it, before} = require('mocha');
const path = require('path');
const {delay: _psetTimeout, presult} = require('@applitools/functional-commons');
const utils = require('@applitools/utils');
const snap = require('@applitools/snaptdout');
const {version} = require('../../package.json');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const pexec = p(exec);

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};
const storybookVersion = process.env.STORYBOOK_VERSION;
const storybookSourceDir = path.resolve(__dirname, '../fixtures/storybookCSFV7/');
const testConfigFile = path.resolve(__dirname, '../e2e/happy-config/storybook-csfV7.config.js');

const eyesStorybookPath = path.resolve(__dirname, '../../bin/eyes-storybook');

describe('storybook-csf-v7', () => {
  before(async () => {
    await pexec(
      `cp -r ${storybookSourceDir}/. ${path.resolve(__dirname, `./${storybookVersion}`)}/`,
    );
  });

  it(`renders storybook in version ${storybookVersion} and CSF with storyStore v7 enabled`, async () => {
    const [err, result] = await presult(
      utils.process.sh(`node ${eyesStorybookPath} -f ${testConfigFile}`, {spawnOptions}),
    );
    const stdout = err ? err.stdout : result.stdout;
    const output = stdout
      .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds')
      .replace(
        /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
        'See details at <some_url>',
      )
      .replace(version, '<version>')
      .replace(/\d+(?:\.\d+)+/g, '<browser_version>');

    await snap(output, `storybook version ${storybookVersion} with CSF ith storyStore v7 enabled`);
  });
});
