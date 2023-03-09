const {describe, it, beforeEach, afterEach} = require('mocha');
const path = require('path');
const {delay: _psetTimeout, presult} = require('@applitools/functional-commons');
const utils = require('@applitools/utils');
const snap = require('@applitools/snaptdout');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const pexec = p(exec);

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: envWithColor};
const testConfigFile = path.resolve(
  __dirname,
  '../e2e/happy-config/storybook-csf.errors.config.js',
);
const storybookSourceDir = path.resolve(
  __dirname,
  '../fixtures/storybook-with-errors-with-version',
);

const eyesStorybookPath = path.resolve(__dirname, '../../bin/eyes-storybook');
const versions = ['6.5', '7.0'];

describe('storybook-csf', () => {
  const currCWD = process.cwd();
  beforeEach(async function() {
    const storybookVersion = this.currentTest.title.substring(0, 3);
    spawnOptions.env['STORYBOOK_VERSIONS_ERROR_TEST'] = storybookVersion;
    process.chdir(
      path.resolve(__dirname, `../fixtures/storybook-with-errors-with-version/${storybookVersion}`),
    );
    await pexec(`npm install`, {
      maxBuffer: 1000000,
    });
    await pexec(
      `cp -r ${storybookSourceDir}/stories/. ${storybookSourceDir}/${storybookVersion}/stories`,
    );
    process.chdir(currCWD);
  });

  for (const version of versions) {
    it(`${version} - renders storybook with render errors with version`, async function() {
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

      await snap(output, `storybook with CSF and render error version ${version}`);
    });
  }

  afterEach(() => {
    delete process.env.STORYBOOK_VERSIONS_ERROR_TEST;
  });
});
