'use strict';
const {resolve} = require('path');
const ora = require('ora');
const StorybookConnector = require('./storybookConnector');
const fs = require('fs');
const {exec} = require('child_process');
const {promisify: p} = require('util');
const pexec = p(exec);
// eslint-disable-next-line
const semver = require('semver');

async function startStorybookServer({
  packagePath,
  storybookPort,
  storybookHost,
  storybookConfigDir,
  storybookStaticDir,
  showStorybookOutput,
  logger,
  startStorybookServerTimeout,
}) {
  const isWindows = process.platform.startsWith('win');
  let storybookPath, sbArg;
  const storybookPathV6 = resolve(packagePath, 'node_modules/.bin/start-storybook');
  const storybookPathV7 = resolve(packagePath, 'node_modules/.bin/sb');
  if (fs.existsSync(resolve(packagePath, 'node_modules/.bin/sb'))) {
    const version = await pexec('node_modules/.bin/sb --version');
    if (semver.satisfies(version.stdout, '<7.0.0')) {
      storybookPath = storybookPathV6;
    } else {
      storybookPath = storybookPathV7;
      sbArg = 'dev';
    }
  } else {
    storybookPath = storybookPathV6;
  }

  const storybookConnector = new StorybookConnector({
    storybookPath,
    storybookPort,
    storybookHost,
    storybookConfigDir,
    storybookStaticDir,
    isWindows,
    logger,
    sbArg,
  });

  if (showStorybookOutput) {
    storybookConnector.on('stderr', str => console.error('start-storybook (stderr):', str));
    storybookConnector.on('stdout', str => console.log('start-storybook (stdout):', str));
  }
  storybookConnector.on('failure', () => {
    spinner.fail('Failed to start storybook server');
    process.exit(1);
  });

  process.on('exit', () => storybookConnector.kill());
  process.on('SIGINT', () => process.exit());
  process.on('SIGTERM', () => process.exit());
  process.on('uncaughtException', () => process.exit(1));

  const spinner = ora('Starting storybook server');
  spinner.start();

  try {
    await storybookConnector.start(startStorybookServerTimeout * 1000);
  } catch (error) {
    spinner.fail(error);
    process.exit(1);
  }
  spinner.succeed('Storybook was started');

  return `http://${storybookHost}:${storybookPort}`;
}

module.exports = startStorybookServer;
