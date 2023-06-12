const {describe, it} = require('mocha');
const path = require('path');
const {spawn} = require('child_process');
const {expect} = require('chai');

describe('eyes-storybook nodiff exitcode', () => {
  it('dont fail on diffs', async () => {
    const binPath = path.resolve(__dirname, '../../bin/eyes-storybook');
    const configPath = path.resolve(__dirname, 'happy-config/nodiffs.config.js');
    const command = `node ${binPath} -f ${configPath}`;

    const child = spawn(command, {
      stdio: 'pipe',
      shell: true,
    });

    let output = '';
    child.stdout.on('data', data => {
      output += data.toString().trim() + '\n';
    });

    const exitCode = await new Promise(resolve => {
      child.on('exit', code => resolve(code));
    });

    expect(exitCode).to.equal(0);
    expect(output).to.contain('A total of 1 difference was found.');
  });
});
