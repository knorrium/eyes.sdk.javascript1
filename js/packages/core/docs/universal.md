# Core Universal Protocol

- [Core Universal Protocol](#core-universal-protocol)
  - [Events](#events)
    - [Core.makeCore](#coremakecore)
    - [Logger.log](#loggerlog)
  - [Commands](#commands)
    - [Core.closeBatch](#coreclosebatch)
    - [Core.deleteTest](#coredeletetest)
    - [Core.getViewportSize](#coregetviewportsize)
    - [Core.setViewportSize](#coresetviewportsize)
    - [Core.getECClient](#coregetecclient)
    - [Core.makeManager](#coremakemanager)
    - [Core.locate](#corelocate)
    - [Core.locateText](#corelocatetext)
    - [Core.extractText](#coreextracttext)
    - [EyesManager.openEyes](#eyesmanageropeneyes)
    - [EyesManager.getResults](#eyesmanagergetresults)
    - [Eyes.check](#eyescheck)
    - [Eyes.checkAndClose](#eyescheckandclose)
    - [Eyes.close](#eyesclose)
    - [Eyes.abort](#eyesabort)
    - [Eyes.getResults](#eyesgetresults)
    - [Debug.getHistory](#debuggethistory)
  - [Type examples](#type-examples)
    - [ImageTarget](#imagetarget)
    - [DriverTarget](#drivertarget)
    - [EyesManagerSettings](#eyesmanagersettings)
    - [LocateSettings](#locatesettings)
    - [LocateTextSettings](#locatetextsettings)
    - [ExtractTextSettings](#extracttextsettings)
    - [ECClientSettings](#ecclientsettings)
    - [OpenSettings](#opensettings)
    - [CheckSettings](#checksettings)
    - [CloseSettings](#closesettings)
    - [GetResultsSettings](#getresultssettings)
    - [Config](#config)
    - [TestResult](#testresult)
    - [Error](#error)


## Events
Events don't imply any response. This is a one-way communication used in order to notify participants about some actions, usually post-factum. Some of the events are meant to be emitted by the server and listened to by the client and some are the other way around.

### Core.makeCore
This event will be listened by the server and meant to be emitted by the client.
```ts
interface MakeCorePayload {
  spec: 'webdriver' | string[]
  agentId: string
  environment?: Record<string, string | number | boolean>
  cwd: string
}
```

### Logger.log
This event will be emitted by the server and meant to be listened by the client.
```ts
interface LogPayload {
  level: 'info' | 'warn' | 'error' | 'fatal',
  message: string
}
```

## Commands

Some command payloads have `settings` and `config` properties. This is done to simplify work on the clients.

The user-facing api has state and two levels of configuring a command (a.k.a. command settings and configuration). But the underlying logic of core doesn't have a large state with configuration (like it used to). It accepts only `settings` of each command at the moment it is called. To avoid making clients do more work (e.g., constructing `settings` objects out of command settings and global configuration) we instead allow them to provide both and the core will handle the merge automatically.

### Core.closeBatch
```ts
interface CloseBatchRequestPayload {
  settings: CloseBatchSettings | CloseBatchSettings[]
}
```

### Core.deleteTest
```ts
interface DeleteTestRequestPayload {
  settings: DeleteTestSettings | DeleteTestSettings[]
}
```

### Core.getViewportSize
```ts
interface GetViewportSizeRequestPayload {
  target: DriverTarget
}

interface GetViewportSizeResponsePayload {
  width: number
  height: number
}
```

### Core.setViewportSize
```ts
interface SetViewportSizeRequestPayload {
  target: DriverTarget
  size: {width: number, height: number}
}
```

### Core.getECClient
```ts
interface GetECClientRequestPayload {
  settings?: ECClientSettings
}

interface GetECClientResponsePayload {
  url: string
}
```

### Core.makeManager
```ts
interface MakeManagerRequestPayload {
  type: 'ufg' | 'classic'
  settings?: EyesManagerSettings
}

type MakeManagerResponsePayload = Ref<EyesManager>
```

### Core.locate
```ts
interface LocateRequestPayload {
  target?: ImageTarget | DriverTarget
  settings?: LocateSettings
  config?: Config
}

interface LocateResponsePayload {
  [key: string]: {x: number, y: number, width: number, height: number}[]>
}
```

### Core.locateText
```ts
interface LocateTextRequestPayload {
  target?: ImageTarget | DriverTarget
  settings?: LocateTextSettings
  config?: Config
}

type LocateTextResponsePayload = Record<string, {text: string, x: number, y: number, width: number, height: number}[]>
```

### Core.extractText
```ts
interface ExtractTextRequestPayload {
  target?: ImageTarget | DriverTarget
  settings?: ExtractTextSettings | ExtractTextSettings[]
  config?: Config
}

type ExtractTextResponsePayload = string[]
```

### EyesManager.openEyes
```ts
interface OpenEyesRequestPayload {
  manager: Ref<EyesManager>
  target?: DriverTarget
  settings?: OpenSettings
  config?: Config
}

type OpenEyesResponsePayload = Ref<Eyes>
```

### EyesManager.getResults
```ts
interface GetManagerResultsRequestPayload {
  manager: Ref<EyesManager>
  settings?: GetResultsSettings
}

interface GetManagerResultsResponsePayload {
  results: {
    error?: Error
    result?: TestResult
    renderer?: TType extends 'ufg' ? Renderer : never
    userTestId: string
  }[]
  passed: number
  unresolved: number
  failed: number
  exceptions: number
  mismatches: number
  missing: number
  matches: number
}
```

### Eyes.check
```ts
interface CheckRequestPayload {
  eyes: Ref<Eyes>
  type?: 'classic' | 'ufg'
  target?: ImageTarget | DriverTarget
  settings?: CheckSettings
  config?: Config
}

type CheckResponsePayload = CheckResult[]
```

### Eyes.checkAndClose
```ts
interface CheckAndCloseRequestPayload {
  eyes: Ref<Eyes>
  type?: 'classic' | 'ufg'
  target?: ImageTarget | DriverTarget
  settings?: CheckSettings & CloseSettings
  config?: Config
}

type CheckAndCloseResponsePayload = TestResult[]
```


### Eyes.close
```ts
interface CloseResponsePayload {
  eyes: Ref<Eyes>
  settings?: CloseSettings
  config?: Config
}

type CloseResponsePayload = void
```

### Eyes.abort
```ts
interface AbortPayload {
  eyes: Ref<Eyes>
  settings?: CloseSettings
}

type AbortResponsePayload = void
```

### Eyes.getResults
```ts
interface GetEyesResultsPayload {
  eyes: Ref<Eyes>
  settings?: GetResultsSettings
}

type GetEyesResultsResponsePayload = TestResult[]
```

### Debug.getHistory
```ts
type GetHistoryResponsePayload = Record<string, any>
```

## Type examples

### ImageTarget
```jsonc
{
  "image": "url | file path | base64",
  "name": "image name",
  "source": "image source",
  "dom": "page dom | url",
  "locationInViewport": {"x": 0, "y": 0},
  "locationInView": {"x": 0, "y": 0},
  "fullViewSize": {"width": 100, "height": 100}
}
```

### DriverTarget
```jsonc
{
  "serverUrl": "http://localhost:2107",
  "proxy": {
    "url": "http://localhost:8080",
    "username": "admin",
    "password": "pa$$worD"
  },
  "sessionId": "123456",
  "capabilities": {}
}
```

### EyesManagerSettings
```jsonc
{
  "concurrency": 10,
  "legacyConcurrency": 50,
  "agentId": "js/eyes/1.0.0"
}
```

### LocateSettings
The `locate` method historically was implemented under the `Eyes` namespace, which require `Core.eyesOpen` call in order to use it. But since server doesn't require a test to start to be able to use this functionality there is no reason for us to do it neither. It doesn't mean user-facing  api should change. Pay attention that there is one new required field added - `appName`, that should be provided either in `settings` or in `config.open`.
```jsonc
{
  "serverUrl": "https://eyesapi.applitools.com/",
  "apiKey": "DFH$HJD%77333J355",
  "proxy": {
    "url": "http://localhost:8080",
    "username": "username",
    "password": "Pa$$w0rD"
  },
  "region": {"type": "css", "selector": "div"},
  "frames": [1, "frame-name", {"type": "css", "selector": "span"}],
  "webview": "webview name",
  "fully": true,
  "scrollRootElement": {"type": "css", "selector": "scrollable"},
  "stitchMode": "CSS",
  "hideScrollbars": true,
  "hideCaret": true,
  "overlap": {"top": 10, "bottom": 10},
  "waitBeforeCapture": 10000,
  "lazyLoad": {"scrollLength": 300, "waitingTime": 500, "maxAmountToScroll": 1000},
  "normalization": {
    "cut": {"left": 0, "bottom": 0, "right": 0, "left": 0},
    "rotation": 90,
    "scaleRatio": 1,
  },
  "debugImages": {"path": "/home/user/screenshots", "prefix": "filename prefix"},
  "appName": "App name",
  "locatorNames": ["locator1", "locator2"],
  "firstOnly": false
}
```

### LocateTextSettings
```jsonc
{
  "serverUrl": "https://eyesapi.applitools.com/",
  "apiKey": "DFH$HJD%77333J355",
  "proxy": {
    "url": "http://localhost:8080",
    "username": "username",
    "password": "Pa$$w0rD"
  },
  "region": {"type": "css", "selector": "div"},
  "frames": [1, "frame-name", {"type": "css", "selector": "span"}],
  "webview": "webview name",
  "fully": true,
  "scrollRootElement": {"type": "css", "selector": "scrollable"},
  "stitchMode": "CSS",
  "hideScrollbars": true,
  "hideCaret": true,
  "overlap": {"top": 10, "bottom": 10},
  "waitBeforeCapture": 10000,
  "lazyLoad": {"scrollLength": 300, "waitingTime": 500, "maxAmountToScroll": 1000},
  "normalization": {
    "cut": {"left": 0, "bottom": 0, "right": 0, "left": 0},
    "rotation": 90,
    "scaleRatio": 1,
  },
  "debugImages": {"path": "/home/user/screenshots", "prefix": "filename prefix"},
  "patterns": ["pattern1", "pattern2"],
  "ignoreCase": true,
  "firstOnly": false,
  "language": "en",
}
```

### ExtractTextSettings
```jsonc
{
  "serverUrl": "https://eyesapi.applitools.com/",
  "apiKey": "DFH$HJD%77333J355",
  "proxy": {
    "url": "http://localhost:8080",
    "username": "username",
    "password": "Pa$$w0rD"
  },
  "region": {"type": "css", "selector": "div"},
  "frames": [1, "frame-name", {"type": "css", "selector": "span"}],
  "webview": "webview name",
  "fully": true,
  "scrollRootElement": {"type": "css", "selector": "scrollable"},
  "stitchMode": "CSS",
  "hideScrollbars": true,
  "hideCaret": true,
  "overlap": {"top": 10, "bottom": 10},
  "waitBeforeCapture": 10000,
  "lazyLoad": {"scrollLength": 300, "waitingTime": 500, "maxAmountToScroll": 1000},
  "normalization": {
    "cut": {"left": 0, "bottom": 0, "right": 0, "left": 0},
    "rotation": 90,
    "scaleRatio": 1,
  },
  "debugImages": {"path": "/home/user/screenshots", "prefix": "filename prefix"},
  "hint": "hint",
  "minMatch": 1,
  "language": "en",
}
```

### ECClientSettings

```jsonc
{
  "options": { // default options that will be used if user do not provide `applitools:` caps
    "serverUrl": "https://eyesapi.applitools.com/",
    "apiKey": "DFH$HJD%77333J355",
  },
  "proxy": {
    "url": "http://localhost:8080",
    "username": "username",
    "password": "Pa$$w0rD"
  },
}
```

### OpenSettings
```jsonc
{
  "serverUrl": "https://eyesapi.applitools.com/",
  "apiKey": "DFH$HJD%77333J355",
  "proxy": {
    "url": "http://localhost:8080",
    "username": "username",
    "password": "Pa$$w0rD"
  },
  "connectionTimeout": 60000,
  "removeSession": false,
  "agentId": "cool-sdk/1.2.7",
  "appName": "App",
  "testName": "Test name",
  "displayName": "Display name",
  "userTestId": "user-unique-id",
  "sessionType": "SEQUENTIAL",
  "properties": [{"name": "Prop name", "value": "Value"}],
  "batch": {
    "id": "Batch id",
    "name": "Batch name",
    "sequenceName": "Sequence name",
    "startedAt": "2022-08-08T09:52:06.043Z",
    "notifyOnCompletion": true,
    "properties": [{"name": "Batch prop name", "value": "Value"}]
  },
  "keepBatchOpen": true,
  "environmentName": "Env name",
  "environment": {
    "os": "OS name",
    "osInfo": "OS info",
    "hostingApp": "Host app name",
    "hostingAppInfo": "Host app info",
    "deviceName": "Device name",
    "viewportSize": {"width": 210, "height": 700},
  },
  "branchName": "Branch name",
  "parentBranchName": "Parent branch name",
  "baselineEnvName": "Baseline env name",
  "baselineBranchName": "Baseline branch name",
  "compareWithParentBranch": true,
  "ignoreBaseline": true,
  "ignoreGitBranching": true,
  "saveDiffs": true,
  "abortIdleTestTimeout": 1000,
}
```

### CheckSettings
```jsonc
{
  "region": {"type": "css", "selector": "div"},
  "frames": [1, "frame-name", {"type": "css", "selector": "span"}],
  "webview": "webview name",
  "fully": true,
  "scrollRootElement": {"type": "css", "selector": "scrollable"},
  "stitchMode": "CSS",
  "screenshotMode": "default",
  "hideScrollbars": true,
  "hideCaret": true,
  "overlap": {"top": 10, "bottom": 10},
  "waitBeforeCapture": 10000,
  "lazyLoad": {"scrollLength": 300, "waitingTime": 500, "maxAmountToScroll": 1000},
  "ignoreDisplacements": false,
  "name": "Step Name",
  "pageId": "Page id",
  "ignoreRegions": [
    {"x": 10, "y": 10, "width": 100, "height": 100},
    {"type": "css", "selector": "div"},
    {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
  ],
  "layoutRegions": [
    {"x": 10, "y": 10, "width": 100, "height": 100},
    {"type": "css", "selector": "div"},
    {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
  ],
  "strictRegions": [
    {"x": 10, "y": 10, "width": 100, "height": 100},
    {"type": "css", "selector": "div"},
    {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
  ],
  "contentRegions": [
    {"x": 10, "y": 10, "width": 100, "height": 100},
    {"type": "css", "selector": "div"},
    {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
  ],
  "floatingRegions": [
    {"x": 10, "y": 10, "width": 100, "height": 100},
    {"type": "css", "selector": "div"},
    {
      "region": {"type": "css", "selector": "div"},
      "offset": {"top": 0, "bottom": 0, "left": 0, "right": 0}
    }
  ],
  "accessibilityRegions": [
    {"x": 10, "y": 10, "width": 100, "height": 100},
    {"type": "css", "selector": "div"},
    {"region": {"type": "css", "selector": "div"}, "type": "LargeText"}
  ],
  "accessibilitySettings": {"level": "AAA", "version": "WCAG_2_0"},
  "matchLevel": "Layout",
  "sendDom": true,
  "useDom": true,
  "enablePatterns": true,
  "ignoreCaret": true,
  "ufgOptions": {},
  "layoutBreakpoints": [365, 568, 724, 1080],
  "disableBrowserFetching": true,
  "retryTimeout": 0,
  "renderers": [
    {"name": "firefox", "width": 210, "height": 700},
    {"chromeEmulationInfo": {"deviceName": "Pixel 4 XL", "screenOrientation": "landscape"}},
    {"iosDeviceInfo": {"deviceName": "iPhone 12", "screenOrientation": "portrait", "version": "latest-1"}},
    {"androidDeviceInfo": {"deviceName": "Pixel 6", "screenOrientation": "portrait", "version": "latest-2"}},
  ],
  "autProxy": {
    "url": "http://localhost:8080",
    "username": "username",
    "password": "Pa$$w0rD",
    "domains": ["https://applitools.com", "https://github.com"],
    "mode": "Allow"
  },
  "hooks": {
    "beforeCaptureScreenshot": "document.documentElement.style.background = 'yellow'"
  },
  "userCommandId": "command id",
  "normalization": {
    "cut": {"left": 0, "bottom": 0, "right": 0, "left": 0},
    "rotation": 90,
    "scaleRatio": 1,
  },
  "debugImages": {"path": "/home/user/screenshots", "prefix": "filename prefix"},
}
```

### CloseSettings
```jsonc
{
  "updateBaselineIfNew": true,
  "updateBaselineIfDifferent": true
}
```

### GetResultsSettings
```jsonc
{
  "throwErr": false,
}
```

### Config
New config structure represents the fact that it just provides a default values for some commands, and doesn't have any property that couldn't be passed in the command settings.
```jsonc
{
  "open": {
    "serverUrl": "https://eyesapi.applitools.com/",
    "apiKey": "DFH$HJD%77333J355",
    "proxy": {
      "url": "http://localhost:8080",
      "username": "username",
      "password": "Pa$$w0rD",
    },
    "connectionTimeout": 60000,
    "removeSession": false,
    "agentId": "cool-sdk/1.2.7",
    "appName": "App",
    "testName": "Test name",
    "displayName": "Display name",
    "userTestId": "user-unique-id",
    "sessionType": "SEQUENTIAL",
    "properties": [{"name": "Prop name", "value": "Value"}],
    "batch": {
      "id": "Batch id",
      "name": "Batch name",
      "sequenceName": "Sequence name",
      "startedAt": "2022-08-08T09:52:06.043Z",
      "notifyOnCompletion": true,
      "properties": [{"name": "Batch prop name", "value": "Value"}]
    },
    "keepBatchOpen": true,
    "environmentName": "Env name",
    "environment": {
      "os": "OS name",
      "osInfo": "OS info",
      "hostingApp": "Host app name",
      "hostingAppInfo": "Host app info",
      "deviceName": "Device name",
      "viewportSize": {"width": 210, "height": 700},
    },
    "branchName": "Branch name",
    "parentBranchName": "Parent branch name",
    "baselineEnvName": "Baseline env name",
    "baselineBranchName": "Baseline branch name",
    "compareWithParentBranch": true,
    "ignoreBaseline": true,
    "ignoreGitBranching": true,
    "saveDiffs": true,
    "abortIdleTestTimeout": true,
  },
  "screenshot": {
      "region": {"type": "css", "selector": "div"},
      "frames": [1, "frame-name", {"type": "css", "selector": "span"}],
      "fully": true,
      "scrollRootElement": {"type": "css", "selector": "scrollable"},
      "stitchMode": "CSS",
      "hideScrollbars": true,
      "hideCaret": true,
      "overlap": {"top": 10, "bottom": 10},
      "waitBeforeCapture": 10000,
      "lazyLoad": {"scrollLength": 300, "waitingTime": 500, "maxAmountToScroll": 1000},
      "ignoreDisplacements": false,
      "normalization": {
        "cut": {"left": 0, "bottom": 0, "right": 0, "left": 0},
        "rotation": 90,
        "scaleRatio": 1,
      },
      "debugImages": {"path": "/home/user/screenshots", "prefix": "filename prefix"},
  },
  "check": {
    "name": "Step Name",
    "pageId": "Page id",
    "ignoreRegions": [
      {"x": 10, "y": 10, "width": 100, "height": 100},
      {"type": "css", "selector": "div"},
      {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
    ],
    "layoutRegions": [
      {"x": 10, "y": 10, "width": 100, "height": 100},
      {"type": "css", "selector": "div"},
      {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
    ],
    "strictRegions": [
      {"x": 10, "y": 10, "width": 100, "height": 100},
      {"type": "css", "selector": "div"},
      {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
    ],
    "contentRegions": [
      {"x": 10, "y": 10, "width": 100, "height": 100},
      {"type": "css", "selector": "div"},
      {"region": {"type": "css", "selector": "div"}, "regionId": "my-region"}
    ],
    "floatingRegions": [
      {"x": 10, "y": 10, "width": 100, "height": 100},
      {"type": "css", "selector": "div"},
      {
        "region": {"type": "css", "selector": "div"},
        "offset": {"top": 0, "bottom": 0, "left": 0, "right": 0}
      }
    ],
    "accessibilityRegions": [
      {"x": 10, "y": 10, "width": 100, "height": 100},
      {"type": "css", "selector": "div"},
      {"region": {"type": "css", "selector": "div"}, "type": "LargeText"}
    ],
    "accessibilitySettings": {"level": "AAA", "version": "WCAG_2_0"},
    "matchLevel": "Layout",
    "retryTimeout": 0,
    "sendDom": true,
    "useDom": true,
    "enablePatterns": true,
    "ignoreCaret": true,
    "ufgOptions": {},
    "layoutBreakpoints": [365, 568, 724, 1080],
    "disableBrowserFetching": true,
    "autProxy": {
      "url": "http://localhost:8080",
      "username": "username",
      "password": "Pa$$w0rD",
      "domains": ["https://applitools.com", "https://github.com"],
      "mode": "Allow"
    },
    "renderers": [
      {"name": "firefox", "width": 210, "height": 700},
      {"chromeEmulationInfo": {"deviceName": "Pixel 4 XL", "screenOrientation": "landscape"}},
      {"iosDeviceInfo": {"deviceName": "iPhone 12", "screenOrientation": "portrait", "iosVersion": "latest-1"}},
      {"androidDeviceInfo": {"deviceName": "Pixel 6", "screenOrientation": "portrait", "version": "latest-2"}},
    ],
    "hooks": {
      "beforeCaptureScreenshot": "document.documentElement.style.background = 'yellow'"
    },
    "userCommandId": "command id"
  },
  "close": {
    "throwErr": false,
    "updateBaselineIfNew": true,
    "updateBaselineIfDifferent": true,
  }
}
```

### TestResult
```jsonc
{
  "id": "numeric-test-id",
  "exactMatches": 0,
  "strictMatches": 0,
  "contentMatches": 0,
  "layoutMatches": 0,
  "noneMatches": 0,
  "steps": 1,
  "matches": 0,
  "mismatches": 1,
  "missing": 0,
  "new": 0,
  "name": "test-name",
  "secretToken": "secret-token",
  "status": "Unresolved",
  "appName": "app-name",
  "baselineId": "baseline-id",
  "batchName": "batch-name",
  "batchId": "batch-d",
  "branchName": "branch-name",
  "hostOS": "Mac OS X 12.6",
  "hostApp": "Safari",
  "hostDisplaySize": { "width": 1280, "height": 1000 },
  "startedAt": "2023-03-10T20:34:03.2773400+00:00",
  "duration": 37,
  "isNew": false,
  "isDifferent": true,
  "isAborted": false,
  "appUrls": {
    "batch": "some-url",
    "session": "some-url"
  },
  "apiUrls": {
    "batch": "some-url",
    "session": "some-url"
  },
  "stepsInfo": [
    {
      "name": "step-name",
      "isDifferent": true,
      "hasBaselineImage": true,
      "hasCurrentImage": true,
      "hasCheckpointImage": true,
      "appUrls": {
        "step": "some-url",
        "stepEditor": "some-url"
      },
      "apiUrls": {
        "baselineImage": "some-url",
        "currentImage": "some-url",
        "checkpointImage": "some-url",
        "checkpointImageThumbnail": "some-url",
        "diffImage": "some-url"
      }
    }
  ],
  "userTestId": "custom-or-generated-user-test-id",
  "url": "dashboard-url"
}
```

### Error

```jsonc
{
  "message": "error-message",
  "stack": "error-stack",
  "type": "internal"
}
```