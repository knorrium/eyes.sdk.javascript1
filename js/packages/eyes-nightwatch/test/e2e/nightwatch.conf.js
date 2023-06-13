module.exports = {
  // An array of folders (excluding subfolders) where your tests are located;
  // if this is not specified, the test source must be passed as the second argument to the test runner.
  src_folders: [],

  // See https://nightwatchjs.org/guide/working-with-page-objects/
  page_objects_path: '',

  // See https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-commands
  custom_commands_path: './commands',

  // See https://nightwatchjs.org/guide/extending-nightwatch/#writing-custom-assertions
  custom_assertions_path: '',

  // See https://nightwatchjs.org/guide/#external-globals
  globals_path: '',

  eyes: {
    enableEyesLogs: false,
    appName: 'eyes-nightwatch',
    testName: 'hello world',
    viewportSize: {width: 800, height: 600},
  },

  test_settings: {
    default: {
      // <parallel>
      live_output: true,
      test_workers: {enabled: true, workers: 'auto'},
      // </ parallel>
      disable_error_log: false,

      screenshots: {
        enabled: false,
        path: 'screens',
        on_failure: true,
      },

      // JSON Wire Protocol (JWP)
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {args: ['--headless']},
      },

      webdriver: {
        port: 4444,
        default_path_prefix: '/wd/hub',
      },
    },
  },
}
