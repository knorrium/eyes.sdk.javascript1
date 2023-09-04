const {describe, it} = require('mocha');
const {expect} = require('chai');
const processResults = require('../../src/processResults');
const snap = require('@applitools/snaptdout');
const stripAnsi = require('strip-ansi');
process.env.FORCE_COLOR = 2;

describe('processResults', () => {
  it('works', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: [
          {
            name: 'someName1',
            appName: 'My Component | Button1',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            name: 'someName2',
            appName: 'My Component | Button2',
            hostDisplaySize: {width: 100, height: 200},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            name: 'someName1',
            appName: 'My Component | Button1',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            name: 'someName2',
            appName: 'My Component | Button2',
            hostDisplaySize: {width: 100, height: 200},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const processResult = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    expect(JSON.stringify(processResult.summary)).to.equal(
      JSON.stringify({
        results: [
          {
            result: {
              name: 'someName1',
              appName: 'My Component | Button1',
              hostDisplaySize: {
                width: 10,
                height: 20,
              },
              appUrls: {batch: 'https://eyes.com/results'},
            },
          },
          {
            result: {
              name: 'someName2',
              appName: 'My Component | Button2',
              hostDisplaySize: {
                width: 100,
                height: 200,
              },
              appUrls: {batch: 'https://eyes.com/results'},
            },
          },
        ],
      }),
    );
  });

  it('works with 1 diff', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            status: 'Passed',
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
            renderer: {name: 'chrome', width: 10, height: 20},
          },
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: [
          {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button1',
            hostApp: 'Firefox',
            hostDisplaySize: {width: 100, height: 200},
            renderer: {name: 'Firefox', width: 100, height: 200},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Passed',
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button1',
            hostApp: 'Firefox',
            hostDisplaySize: {width: 100, height: 200},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(
      outputStr.replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
      'single diff',
    );
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('works with multiple diffs', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: [
          {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button1',
            hostApp: 'Firefox',
            hostDisplaySize: {width: 100, height: 200},
            renderer: {name: 'Firefox', width: 100, height: 200},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button1',
            hostApp: 'Firefox',
            hostDisplaySize: {width: 100, height: 200},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(
      outputStr.replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
      'multi diff',
    );
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('works with 1 error', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            status: 'Passed',
            isDifferent: false,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: new Error('some error message !'),
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Passed',
            isDifferent: false,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(outputStr, 'single err');
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(1);
  });

  it('works with multiple errors', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: new Error('another error messgae !'),
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: new Error('some error messgae !'),
      },
    ];
    const summary = {
      results: [
        {
          result: {
            isAborted: true,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            isAborted: true,
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(stripAnsi(outputStr), 'multi err');
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(1);
  });

  it('works with diffs and errors', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: new Error('some error messgae !'),
      },
      {
        title: 'My Component | Button3',
        resultsOrErr: new Error('some error messgae !'),
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Unresolved',
            isDifferent: true,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            name: 'My Component | Button1',
          },
        },
        {
          result: {
            name: 'My Component | Button3',
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(
      outputStr.replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
      'diffs and errors',
    );
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(1);
  });

  it('works with no diifs and no errors', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            status: 'Passed',
            isDifferent: false,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Passed',
            isDifferent: false,
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(outputStr, 'no diff no errors');
    expect(exitCode).to.eql(0);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('works with no diffs no errors and no succeeses', async () => {
    const results = [];
    const summary = {
      results: [],
    };

    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(outputStr, 'empty');
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('passes errors to the formatter correctly', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: [new Error('some error message')],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            name: 'My Component | Button1',
          },
          error: {message: 'some error message'},
        },
      ],
    };
    const pr = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    const storedResults = pr.summary.results;
    expect(storedResults.length).to.eql(1);
    expect(storedResults[0].result.name).to.eql('My Component | Button1');
    expect(storedResults[0].error.message).to.eql(results[0].resultsOrErr[0].message);
  });

  it('passes errors at the story level (not the rendering in vgc) to the formatter correctly', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: new Error('some error message thrown e.g. inside getStoryData'),
      },
    ];
    const summary = {
      results: [
        {
          result: {
            name: 'My Component | Button1',
          },
          error: {message: 'some error message thrown e.g. inside getStoryData'},
        },
      ],
    };
    const {summary: processResultsSummary} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    const storedResults = processResultsSummary.results;
    expect(storedResults.length).to.eql(1);
    expect(storedResults[0].result.name).to.eql('My Component | Button1');
    expect(storedResults[0].error.message).to.eql(results[0].resultsOrErr.message);
  });

  it('works with new test while saveNewTests set to false', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: [
          {
            status: 'Unresolved',
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Unresolved',
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      saveNewTests: false,
      configExitCode: true,
    });
    await snap(outputStr, 'new without saving');
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('works with two new tests while saveNewTests set to false', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: [
          {
            status: 'Unresolved',
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button2',
        resultsOrErr: [
          {
            status: 'Unresolved',
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Unresolved',
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
        {
          result: {
            status: 'Unresolved',
            name: 'My Component | Button2',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      saveNewTests: false,
      configExitCode: true,
    });
    await snap(outputStr, 'two new without saving');
    expect(exitCode).to.eql(1);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('works with new test while saveNewTests unset or set to true', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: [
          {
            status: 'Unresolved',
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            renderer: {name: 'chrome', width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            status: 'Unresolved',
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            isNew: true,
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
    });
    await snap(outputStr, 'new with saving');
    expect(exitCode).to.eql(0);

    // test exitcode false
    const {exitCode: exitCodeFalse} = processResults({
      results: {summary, results},
      configExitCode: false,
    });
    expect(exitCodeFalse).to.eql(0);

    // test exitcode 'nodiffs'
    const {exitCode: exitCodeNoDiffs} = processResults({
      results: {summary, results},
      configExitCode: 'nodiffs',
    });
    expect(exitCodeNoDiffs).to.eql(0);
  });

  it('works with aborted test', async () => {
    const results = [
      {
        name: 'someName1',
        appName: 'My Component | Button1',
        hostDisplaySize: {width: 10, height: 20},
        appUrls: {batch: 'https://eyes.com/results'},
        resultsOrErr: [{renderer: [{name: 'chrome', width: 800, height: 600}]}],
      },
      ,
      {
        title: 'My Component | Button2',
        resultsOrErr: new Error('Failed to get story data for someName2, test was aborted'),
      },
    ];
    const summary = {
      results: [
        {
          result: {
            name: 'someName1',
            appName: 'My Component | Button1',
            hostDisplaySize: {width: 10, height: 20},
            hostApp: 'Chrome',
            appUrls: {batch: 'https://eyes.com/results'},
            status: 'Passed',
          },
        },
        {
          result: {
            name: 'someName2',
            appName: 'My Component | Button2',
            hostDisplaySize: {width: 100, height: 200},
            hostApp: 'Chrome',
            appUrls: {batch: 'https://eyes.com/results'},
            isAborted: true,
            error: {message: 'Test is failed! See details at bla'},
          },
        },
      ],
    };
    const processResult = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    await snap(stripAnsi(processResult.outputStr), 'aborted test');
  });

  it('works when all stories fail', async () => {
    const results = [
      {
        title: 'My Component | Button1',
        resultsOrErr: new Error('Error while processing story'),
      },
      {
        title: 'My Component | Button2',
        resultsOrErr: new Error('Error while processing story'),
      },
    ];
    const summary = {
      results: [undefined, undefined],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
      configExitCode: true,
    });
    await snap(stripAnsi(outputStr), 'all stories fail');
    expect(exitCode).to.eql(1);
  });
});
