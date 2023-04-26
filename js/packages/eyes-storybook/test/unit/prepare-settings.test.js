const {prepareTakeDomSnapshotsSettings} = require('../../src/utils/prepare-settings');
const assert = require('assert');

describe('prepare-settings', () => {
  describe('takeDomSnapshots', () => {
    it('works', () => {
      const config = {
        layoutBreakpoints: [500, 1000],
        disableBrowserFetching: true,
      };
      const result = prepareTakeDomSnapshotsSettings({
        config,
        options: {
          renderers: [],
          waitBeforeCapture: 1000,
          skipResources: [],
        },
      });
      assert.deepStrictEqual(result, {
        layoutBreakpoints: [500, 1000],
        renderers: [],
        waitBeforeCapture: 1000,
        skipResources: [],
        disableBrowserFetching: true,
      });
    });
    it('layoutBreakpoints in config are overriden by layoutBreakpoints in options', () => {
      const config = {
        layoutBreakpoints: [500, 1000],
        disableBrowserFetching: true,
      };
      const result = prepareTakeDomSnapshotsSettings({
        config,
        options: {
          layoutBreakpoints: false,
          renderers: [],
          waitBeforeCapture: 1000,
          skipResources: [],
        },
      });
      assert.deepStrictEqual(result, {
        layoutBreakpoints: false,
        renderers: [],
        waitBeforeCapture: 1000,
        skipResources: [],
        disableBrowserFetching: true,
      });
    });
  });
});
