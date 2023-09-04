'use strict';
const flatten = require('lodash.flatten');
const chalk = require('chalk');
const utils = require('@applitools/utils');
const uniq = require('./uniq');
const concurrencyMsg = require('./concurrencyMsg');

function processResults({
  results,
  totalTime,
  testConcurrency,
  saveNewTests = true,
  configExitCode,
}) {
  let outputStr = '\n';
  const pluralize = utils.general.pluralize;
  const flattenedTestResults = flatten(results.summary.results);
  const testResults = flattenedTestResults.filter(r => r && r.result);
  const testResultsWithErrors = flattenedTestResults.filter(r => r && r.error);
  const unresolved = testResults.filter(r => r.result.isDifferent && !r.result.isAborted);
  const passedOrNew = testResults.filter(
    r => r.result.status === 'Passed' || (r.result.isNew && !r.result.isAborted),
  );
  const aborted = testResults.filter(r => r.result.isAborted);
  const newTests = testResults.filter(r => r.result.isNew && !r.result.isAborted);
  const newTestsSize = newTests.length;
  const warnForUnsavedNewTests = !!(!saveNewTests && newTestsSize);
  const errMessagesToExclude = [
    'detected differences',
    'Please approve the new baseline',
    'is failed! See details at',
  ];

  const resultsErr = results.results
    .map(result => {
      if (!Array.isArray(result.resultsOrErr)) {
        return {error: result.resultsOrErr, title: result.title};
      }
    })
    .filter(Boolean);

  const errors = testResultsWithErrors
    .filter(({error}) => error && !errMessagesToExclude.some(msg => error.message.includes(msg)))
    .map(({result, error, eyes}) => ({
      error,
      title: result?.name || eyes?.test.testName,
    }))
    .concat(resultsErr);

  const hasResults = unresolved.length || passedOrNew.length || aborted.length;
  const seeDetailsStr =
    hasResults &&
    `See details at ${(passedOrNew[0] || unresolved[0] || aborted[0]).result.appUrls.batch}`;

  if (hasResults) {
    outputStr += `${seeDetailsStr}\n\n`;
  }

  outputStr += '[EYES: TEST RESULTS]:\n\n';
  if (passedOrNew.length > 0) {
    outputStr += testResultsOutput(passedOrNew, warnForUnsavedNewTests);
  }
  if (unresolved.length > 0) {
    outputStr += testResultsOutput(unresolved, warnForUnsavedNewTests);
  }
  if (aborted.length > 0) {
    outputStr += testResultsOutput(aborted, warnForUnsavedNewTests);
  }
  if (errors.length) {
    const sortedErrors = errors.sort((a, b) => a.title.localeCompare(b.title));
    outputStr += uniq(
      sortedErrors.map(
        ({title, error}) =>
          `${title} - ${chalk.red('Failed')}. ${error.message || error.toString()}`,
      ),
    ).join('\n');
    outputStr += '\n';
  }

  if (!errors.length && !hasResults) {
    outputStr += 'Test is finished but no results returned.\n';
  }

  if (errors.length && !unresolved.length) {
    outputStr += chalk.red(
      `\nA total of ${errors.length} stor${pluralize(errors, [
        'ies',
        'y',
      ])} failed for unexpected error${pluralize(errors)}.`,
    );
  } else if (unresolved.length && !errors.length) {
    outputStr += chalk.keyword('orange')(
      `\nA total of ${unresolved.length} difference${pluralize(unresolved, [
        's were',
        ' was',
      ])} found.`,
    );
  } else if (unresolved.length || errors.length) {
    outputStr += chalk.red(
      `\nA total of ${unresolved.length} difference${pluralize(unresolved, [
        's were',
        ' was',
      ])} found and ${errors.length} stor${pluralize(errors, ['ies', 'y'])} failed for ${pluralize(
        errors,
        ['', 'an '],
      )}unexpected error${pluralize(errors)}.`,
    );
  } else if (warnForUnsavedNewTests) {
    const countText =
      newTestsSize > 1
        ? `are ${newTestsSize} new tests`
        : `is a new test: '${newTests[0].result.name}'`;
    outputStr += chalk.red(
      `\n'saveNewTests' was set to false and there ${countText}. Please approve ${pluralize(
        newTestsSize,
        ['their', 'its'],
      )} baseline${pluralize(newTestsSize)} in Eyes dashboard.\n`,
    );
  } else if (passedOrNew.length) {
    outputStr += chalk.green(`\nNo differences were found!`);
  }

  if (hasResults) {
    outputStr += `\n${seeDetailsStr}\nTotal time: ${Math.round(totalTime / 1000)} seconds\n`;
  }

  if (Number(testConcurrency) === 5) {
    // TODO require from core
    outputStr += `\n${concurrencyMsg}\n`;
  }

  let exitCode;
  if (!configExitCode) {
    exitCode = 0;
  } else if (configExitCode === 'nodiffs') {
    exitCode = errors.length ? 1 : 0;
  } else {
    exitCode =
      !warnForUnsavedNewTests && passedOrNew.length && !errors.length && !unresolved.length ? 0 : 1;
  }
  return {
    outputStr,
    summary: results.summary,
    exitCode,
  };
}

function testResultsOutput(results, warnForUnsavedNewTests) {
  let outputStr = '';
  const sortedTestResults = results.sort((a, b) => a.result.name.localeCompare(b.result.name));
  sortedTestResults.forEach(result => {
    const storyTitle = `${result.result.name} [${result.result.hostApp}] [${result.result.hostDisplaySize.width}x${result.result.hostDisplaySize.height}] - `;

    if (result.result.isAborted) {
      outputStr += `${storyTitle}${chalk.keyword('red')(`Aborted`)}\n`;
    } else if (result.result.isNew) {
      const newResColor = warnForUnsavedNewTests ? 'orange' : 'blue';
      outputStr += `${storyTitle}${chalk.keyword(newResColor)('New')}\n`;
    } else if (!result.result.isDifferent) {
      outputStr += `${storyTitle}${chalk.green('Passed')}\n`;
    } else {
      outputStr += `${storyTitle}${chalk.keyword('orange')(`Unresolved`)}\n`;
    }
  });
  outputStr += '\n';
  return outputStr;
}

module.exports = processResults;
