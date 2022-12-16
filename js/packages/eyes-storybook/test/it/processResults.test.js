const {describe, it} = require('mocha');
const {expect} = require('chai');
const processResults = require('../../src/processResults');
const snap = require('@applitools/snaptdout');
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
    expect(processResult.formatter).to.equal(
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
    });
    await snap(
      outputStr.replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
      'single diff',
    );
    expect(exitCode).to.eql(1);
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
    });
    await snap(
      outputStr.replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
      'multi diff',
    );
    expect(exitCode).to.eql(1);
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
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: [new Error('some error message !')],
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
          error: {message: 'some error message !'},
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
    });
    await snap(outputStr, 'single err');
    expect(exitCode).to.eql(1);
  });

  it('works with multiple errors', async () => {
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
            appUrls: {batch: 'https://eyes.com/results'},
          },
          new Error('another error messgae !'),
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: [new Error('some error messgae !')],
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
          error: {message: 'another error messgae !'},
        },
        {
          result: {
            name: 'My Component | Button1',
            hostApp: 'Chrome',
            hostDisplaySize: {width: 10, height: 20},
            appUrls: {batch: 'https://eyes.com/results'},
          },
          error: {message: 'some error messgae !'},
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    await snap(outputStr, 'multi err');
    expect(exitCode).to.eql(1);
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
            appUrls: {batch: 'https://eyes.com/results'},
          },
        ],
      },
      {
        title: 'My Component | Button1',
        resultsOrErr: [new Error('some error messgae !')],
      },
      {
        title: 'My Component | Button3',
        resultsOrErr: [new Error('some error messgae !')],
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
          error: {message: 'some error messgae !'},
        },
        {
          result: {
            name: 'My Component | Button3',
          },
          error: {message: 'some error messgae !'},
        },
      ],
    };
    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    await snap(
      outputStr.replace(/Total time\: \d+ seconds/, 'Total time: <some_time> seconds'),
      'diffs and errors',
    );
    expect(exitCode).to.eql(1);
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
    });
    await snap(outputStr, 'no diff no errors');
    expect(exitCode).to.eql(0);
  });

  it('works with no diffs no errors and no succeeses', async () => {
    const results = [
      {
        title: 'My Component | Button2',
        resultsOrErr: [],
      },
    ];
    const summary = {
      results: [
        {
          result: {
            name: 'My Component | Button2',
          },
        },
      ],
    };

    const {outputStr, exitCode} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    console.log(outputStr);
    await snap(outputStr, 'empty');
    expect(exitCode).to.eql(1);
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
    const {formatter} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    const storedResults = JSON.parse(formatter).results;
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
    const {formatter} = processResults({
      results: {summary, results},
      totalTime: 10000,
      concurrency: 1,
    });
    const storedResults = JSON.parse(formatter).results;
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
    });
    await snap(outputStr, 'new without saving');
    expect(exitCode).to.eql(1);
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
    });
    console.log(outputStr);
    await snap(outputStr, 'two new without saving');
    expect(exitCode).to.eql(1);
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
    console.log(outputStr);
    await snap(outputStr, 'new with saving');
    expect(exitCode).to.eql(0);
  });
});
