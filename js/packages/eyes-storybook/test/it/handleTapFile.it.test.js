const fs = require('fs');
const {resolve} = require('path');
const {promisify} = require('util');
const {describe, it} = require('mocha');
const {expect} = require('chai');
const handleTapFile = require('../../src/handleTapFile');
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

describe('handleTapFile', () => {
  it('works', async () => {
    let path;
    try {
      path = handleTapFile(__dirname, {
        results: [
          {
            result: {
              exactMatches: 0,
              strictMatches: 0,
              contentMatches: 0,
              layoutMatches: 0,
              noneMatches: 0,
              steps: 1,
              matches: 1,
              mismatches: 0,
              missing: 0,
              new: 0,
              name: 'Single category: Single story',
              secretToken: 'J8pxNgL8mVTsJaO7bMc9KWtb106titoUV4LlGEJWrUsIA110',
              id: '00000251721186054963',
              status: 'Passed',
              appName: 'Multi browser version',
              baselineId:
                'k~!~!24b9587d-d8e8-4155-b03b-14a08fcb5718~!1fd351ae-cf08-4ede-aaca-71b7c314d44b~!DCvv79_2LkvODE5oLFPI4SGOUd4drPbSjrNbsNtxRPw_~!',
              batchName: 'Simple storybook',
              batchId: '00000251721186055133',
              branchName: 'default',
              hostOS: 'Linux',
              hostApp: 'Chrome 111.0',
              hostDisplaySize: {
                width: 640,
                height: 480,
              },
              startedAt: '2023-04-10T08:19:04.8479602+00:00',
              duration: 8,
              isNew: false,
              isDifferent: false,
              isAborted: false,
              defaultMatchSettings: {
                matchLevel: 'Strict',
                ignore: [],
                strict: [],
                content: [],
                layout: [],
                floating: [],
                accessibility: [],
                identifiedRegions: {
                  ignore: [],
                  strict: [],
                  content: [],
                  layout: [],
                },
                splitTopHeight: 0,
                splitBottomHeight: 0,
                ignoreCaret: false,
                ignoreDisplacements: false,
                scale: 1,
                remainder: 0,
                useDom: true,
                useDL: false,
                enablePatterns: false,
              },
              appUrls: {
                batch:
                  'https://eyes.applitools.com/app/test-results/00000251721186055133?accountId=UAujt6tHnEKUivQXIz7G6A~~',
                session:
                  'https://eyes.applitools.com/app/test-results/00000251721186055133/00000251721186054963?accountId=UAujt6tHnEKUivQXIz7G6A~~',
              },
              apiUrls: {
                batch: 'https://eyesapi.applitools.com/api/sessions/batches/00000251721186055133',
                session:
                  'https://eyesapi.applitools.com/api/sessions/batches/00000251721186055133/00000251721186054963',
              },
              stepsInfo: [
                {
                  name: '',
                  isDifferent: false,
                  hasBaselineImage: true,
                  hasCurrentImage: true,
                  hasCheckpointImage: true,
                  appUrls: {
                    step:
                      'https://eyes.applitools.com/app/test-results/00000251721186055133/00000251721186054963/steps/1?accountId=UAujt6tHnEKUivQXIz7G6A~~',
                    stepEditor:
                      'https://eyes.applitools.com/app/test-results/00000251721186055133/00000251721186054963/steps/1/edit?accountId=UAujt6tHnEKUivQXIz7G6A~~',
                  },
                  apiUrls: {
                    baselineImage:
                      'https://eyesapi.applitools.com/api/images/se~7b9d8032-7a98-4492-9ebe-e903231ca13d',
                    currentImage:
                      'https://eyesapi.applitools.com/api/sessions/batches/00000251721186055133/00000251721186054963/steps/1/images/checkpoint',
                    checkpointImage:
                      'https://eyesapi.applitools.com/api/sessions/batches/00000251721186055133/00000251721186054963/steps/1/images/checkpoint',
                    checkpointImageThumbnail:
                      'https://eyesapi.applitools.com/api/sessions/batches/00000251721186055133/00000251721186054963/steps/1/images/checkpoint-thumbnail',
                    diffImage:
                      'https://eyesapi.applitools.com/api/sessions/batches/00000251721186055133/00000251721186054963/steps/1/images/diff',
                  },
                },
              ],
              userTestId: 'Single category: Single story--e4ba6a03-da25-4748-946e-1341f78ee990',
              renderer: {
                width: 640,
                height: 480,
                name: 'chrome-one-version-back',
              },
            },
            userTestId: 'Single category: Single story--e4ba6a03-da25-4748-946e-1341f78ee990',
            renderer: {
              width: 640,
              height: 480,
              name: 'chrome-one-version-back',
            },
          },
        ],
        passed: 1,
        unresolved: 0,
        failed: 0,
        exceptions: 0,
        mismatches: 0,
        missing: 0,
        matches: 1,
      });
      expect(path).to.be.equal(resolve(__dirname, 'eyes.tap'));
      const content = await readFile(resolve(__dirname, 'eyes.tap'), 'utf8');
      expect(content).to.be.equal(`1..1
ok 1 - [PASSED TEST] Test: 'Single category: Single story', Application: 'Multi browser version'
#	Test url: https://eyes.applitools.com/app/test-results/00000251721186055133/00000251721186054963?accountId=UAujt6tHnEKUivQXIz7G6A~~
#	Browser: Chrome 111.0, Viewport: 640X640
`);
    } finally {
      path && (await unlink(path));
    }
  });
});
