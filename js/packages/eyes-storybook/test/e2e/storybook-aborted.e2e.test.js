const {describe, it, before, after} = require('mocha');
const path = require('path');
const {testServerInProcess} = require('@applitools/test-server');
const utils = require('@applitools/utils');
const os = require('os');
const fs = require('fs');
const {presult} = require('@applitools/functional-commons');
const {version} = require('../../package.json');
const snap = require('@applitools/snaptdout');
const stripAnsi = require('strip-ansi');

const envWithColor = {...process.env, FORCE_COLOR: true};
const spawnOptions = {stdio: 'pipe', env: {...envWithColor, APPLITOOLS_PAGE_EVALUATE_TIMEOUT: 0}};
const tmpdir = path.resolve(os.tmpdir(), 'eyes-storybook');

describe('make sure failed test is included in the test results', () => {
  let closeTestServer, showLogsOrig;
  before(async () => {
    fs.mkdirSync(tmpdir, {recursive: true});
    closeTestServer = (await testServerInProcess({port: 7272})).close;
    showLogsOrig = process.env.APPLITOOLS_SHOW_LOGS;
    if (showLogsOrig) {
      console.warn(
        '\nThis test disables APPLITOOLS_SHOW_LOGS so dont be surprised son !!! See: test/e2e/eyes-storybook.e2e.test.js:15\n',
      );
    }
    delete process.env.APPLITOOLS_SHOW_LOGS;
  });

  after(async () => {
    await closeTestServer();
    process.env.APPLITOOLS_SHOW_LOGS = '';
    fs.rmdirSync(tmpdir, {recursive: true, force: true});
  });

  it('make sure failed test is included in the test results', async () => {
    const [err, result] = await presult(
      utils.process.sh(
        `node ${path.resolve(__dirname, '../../bin/eyes-storybook')} -f ${path.resolve(
          __dirname,
          'happy-config/aborted-test.config.js',
        )}`,
        {spawnOptions},
      ),
    );

    const stdout = err ? err.stdout : result.stdout;

    const normalizedStdout = stripAnsi(
      stdout
        .replace(/\[Chrome \d+.\d+\]/g, '[Chrome]')
        .replace(version, '<version>')
        .replace(
          /See details at https\:\/\/.+.applitools.com\/app\/test-results\/.+/g,
          'See details at <some_url>',
        )
        .replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
    );

    await snap(normalizedStdout, 'stdout');
  });
});
