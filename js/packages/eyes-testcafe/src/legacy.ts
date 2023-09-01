import type {MaybeArray} from '@applitools/utils'
import type {SpecType} from '@applitools/driver'
import type {PrimarySpecType} from './spec-driver'
import {formatters} from '@applitools/core'
import * as eyes from '@applitools/eyes'
import * as utils from '@applitools/utils'
import * as fs from 'fs'
import * as path from 'path'
import * as spec from './spec-driver'

export interface LegacyTestCafeEyes<TSpec extends SpecType> {
  open(options: {t: TSpec['driver']} & TestCafeConfiguration): Promise<TSpec['driver']>
  checkWindow(settings: TestCafeCheckSettings<TSpec>): Promise<eyes.MatchResult>
  waitForResults(throwErr: boolean): Promise<eyes.TestResultsSummary>
}

export interface LegacyTestCafeEyesConstructor<TSpec extends SpecType>
  extends Pick<typeof eyes.Eyes, keyof typeof eyes.Eyes> {
  new (runner?: eyes.EyesRunner, config?: eyes.ConfigurationPlain<TSpec>): eyes.Eyes<TSpec> & LegacyTestCafeEyes<TSpec>
  new (config?: eyes.ConfigurationPlain<TSpec>, runner?: eyes.EyesRunner): eyes.Eyes<TSpec> & LegacyTestCafeEyes<TSpec>
  new (options: {configPath: string; runner?: eyes.EyesRunner}): eyes.Eyes<TSpec> & LegacyTestCafeEyes<TSpec>
}

export function LegacyTestCafeEyesMixin<TSpec extends PrimarySpecType>(
  Eyes: typeof eyes.Eyes,
): LegacyTestCafeEyesConstructor<TSpec> {
  return class TestCafeEyes extends Eyes<TSpec> implements LegacyTestCafeEyes<TSpec> {
    private _testcafeConfig?: TestCafeConfiguration

    constructor(runner?: eyes.EyesRunner, config?: eyes.ConfigurationPlain<TSpec>)
    constructor(config?: eyes.ConfigurationPlain<TSpec>, runner?: eyes.EyesRunner)
    constructor(options?: {configPath: string; runner?: eyes.EyesRunner})
    constructor(
      runnerOrConfigOrOptions?:
        | eyes.EyesRunner
        | eyes.ConfigurationPlain<TSpec>
        | {configPath: string; runner?: eyes.EyesRunner},
      configOrRunner?: eyes.ConfigurationPlain<TSpec> | eyes.EyesRunner,
    ) {
      if (utils.types.isNull(runnerOrConfigOrOptions) || utils.types.has(runnerOrConfigOrOptions, 'configPath')) {
        const testcafeConfig = utils.config.getConfig({
          paths: runnerOrConfigOrOptions?.configPath ? [runnerOrConfigOrOptions.configPath] : undefined,
          params: ['failTestcafeOnDiff'],
        })
        const runner =
          runnerOrConfigOrOptions?.runner ??
          new eyes.VisualGridRunner({
            testConcurrency: testcafeConfig.concurrency ?? testcafeConfig.testConcurrency ?? 1,
          })
        super(runner, transformConfig(testcafeConfig))
        this._testcafeConfig = testcafeConfig
      } else {
        super(runnerOrConfigOrOptions as eyes.EyesRunner, configOrRunner as eyes.ConfigurationPlain<TSpec>)
      }
    }

    async open(driver: TSpec['driver'], config?: eyes.ConfigurationPlain<TSpec>): Promise<TSpec['driver']>
    async open(
      driver: TSpec['driver'],
      appName?: string,
      testName?: string,
      viewportSize?: eyes.RectangleSize,
      sessionType?: eyes.SessionType,
    ): Promise<TSpec['driver']>
    async open(config?: eyes.ConfigurationPlain<TSpec>): Promise<void>
    async open(
      appName?: string,
      testName?: string,
      viewportSize?: eyes.RectangleSize,
      sessionType?: eyes.SessionType,
    ): Promise<void>
    async open(options: {t: TSpec['driver']} & TestCafeConfiguration): Promise<TSpec['driver']>
    async open(
      driverOrConfigOrAppNameOrOptions?:
        | TSpec['driver']
        | eyes.ConfigurationPlain<TSpec>
        | string
        | ({t: TSpec['driver']} & TestCafeConfiguration),
      configOrAppNameOrTestName?: eyes.ConfigurationPlain<TSpec> | string,
      testNameOrViewportSize?: string | eyes.RectangleSizePlain,
      viewportSizeOrSessionType?: eyes.RectangleSizePlain | eyes.SessionType,
      sessionType?: eyes.SessionType,
    ): Promise<TSpec['driver'] | void> {
      let driver: TSpec['driver'] | undefined, config: eyes.ConfigurationPlain<TSpec> | undefined
      if (spec.isDriver(driverOrConfigOrAppNameOrOptions)) {
        driver = driverOrConfigOrAppNameOrOptions
        config = utils.types.isString(configOrAppNameOrTestName)
          ? {
              appName: configOrAppNameOrTestName,
              testName: testNameOrViewportSize as string,
              viewportSize: viewportSizeOrSessionType as eyes.RectangleSize,
              sessionType,
            }
          : configOrAppNameOrTestName
      } else if (utils.types.has(driverOrConfigOrAppNameOrOptions, 't')) {
        const {t, ...testcafeConfig} = driverOrConfigOrAppNameOrOptions
        this._testcafeConfig = {...this._testcafeConfig, ...testcafeConfig}
        driver = t
        config = transformConfig(this._testcafeConfig)
      } else {
        config = utils.types.isString(configOrAppNameOrTestName)
          ? {
              appName: configOrAppNameOrTestName,
              testName: testNameOrViewportSize as string,
              viewportSize: viewportSizeOrSessionType as eyes.RectangleSize,
              sessionType,
            }
          : configOrAppNameOrTestName
      }

      if (this._testcafeConfig?.showLogs) this.setLogHandler({type: 'console'})

      if (driver) {
        // driver health check, re: https://trello.com/c/xNCZNfPi
        await spec
          .executeScript(driver, () => true)
          .catch(() => {
            throw new Error(
              `The browser is in an invalid state due to JS errors on the page that TestCafe is unable to handle. Try running the test with TestCafe's --skip-js-errors option enabled: https://devexpress.github.io/testcafe/documentation/reference/configuration-file.html#skipjserrors`,
            )
          })
        config
        return super.open(driver, config)
      } else {
        return super.open(config)
      }
    }

    async checkWindow(name?: string, timeout?: number, fully?: boolean): Promise<eyes.MatchResult>
    async checkWindow(settings: TestCafeCheckSettings<TSpec>): Promise<eyes.MatchResult>
    async checkWindow(
      nameOrSetting?: string | TestCafeCheckSettings<TSpec>,
      timeout?: number,
      fully = true,
    ): Promise<eyes.MatchResult> {
      if (utils.types.isObject(nameOrSetting)) {
        return super.check(transformCheckSettings<TSpec>(nameOrSetting))
      }
      return super.checkWindow(nameOrSetting, timeout, fully)
    }

    async close(throwErr = true): Promise<eyes.TestResults> {
      return super.close(throwErr && (this._testcafeConfig?.failTestcafeOnDiff ?? true))
    }

    async waitForResults(throwErr = true) {
      const resultsSummary = await this.runner.getAllTestResults(
        throwErr && (this._testcafeConfig?.failTestcafeOnDiff ?? true),
      )
      if (this._testcafeConfig?.tapDirPath) {
        const results = resultsSummary.getAllResults().map(r => r.getTestResults())
        const formatted = formatters.toHierarchicTAPString(results as any, {
          includeSubTests: false,
          markNewAsPassed: true,
        })
        fs.writeFileSync(path.resolve(this._testcafeConfig.tapDirPath, 'eyes.tap'), formatted)
      }
      return resultsSummary
    }
  }
}

type RegionReference<TSelector> = eyes.RegionPlain | eyes.LegacyRegionPlain | TSelector | {selector: string | TSelector}

type FloatingRegionReference<TSelector> = RegionReference<TSelector> & {
  maxUpOffset?: number
  maxDownOffset?: number
  maxLeftOffset?: number
  maxRightOffset?: number
}

type AccessibilityRegionReference<TSelector> = RegionReference<TSelector> & {
  accessibilityType: eyes.AccessibilityRegionType | eyes.AccessibilityRegionTypePlain
}

export type TestCafeCheckSettings<TSpec extends SpecType> = {
  tag?: string
  target?: 'window' | 'region'
  fully?: boolean
  selector?: string | TSpec['selector']
  region?: eyes.RegionPlain | eyes.LegacyRegionPlain
  ignore?: MaybeArray<RegionReference<TSpec['selector']>>
  floating?: MaybeArray<FloatingRegionReference<TSpec['selector']>>
  layout?: MaybeArray<RegionReference<TSpec['selector']>>
  content?: MaybeArray<RegionReference<TSpec['selector']>>
  strict?: MaybeArray<RegionReference<TSpec['selector']>>
  accessibility?: MaybeArray<AccessibilityRegionReference<TSpec['selector']>>
  scriptHooks?: {beforeCaptureScreenshot: string}
  sendDom?: boolean
  ignoreDisplacements?: boolean
  enablePatterns?: boolean
}

export type TestCafeConfiguration = {
  apiKey?: string
  serverUrl?: string
  appName?: string
  testName?: string
  browser?:
    | eyes.DesktopBrowserInfo
    | eyes.ChromeEmulationInfo
    | eyes.IOSDeviceInfo
    | (eyes.DesktopBrowserInfo | eyes.ChromeEmulationInfo | eyes.IOSDeviceInfo)[]
  batchId?: string
  batchName?: string
  batchSequenceName?: string
  batchSequence?: string
  baselineEnvName?: string
  envName?: string
  proxy?: string | eyes.ProxySettingsPlain
  ignoreCaret?: boolean
  matchLevel?: eyes.MatchLevel | eyes.MatchLevelPlain
  baselineBranchName?: string
  baselineBranch?: string
  parentBranchName?: string
  parentBranch?: string
  branchName?: string
  branch?: string
  saveDiffs?: boolean
  saveFailedTests?: boolean
  saveNewTests?: boolean
  properties?: {name: string; value: any}[]
  compareWithParentBranch?: boolean
  ignoreBaseline?: boolean
  accessibilityValidation?: eyes.AccessibilitySettings
  notifyOnCompletion?: boolean
  batchNotify?: boolean
  isDisabled?: boolean
  ignoreDisplacements?: boolean
  dontCloseBatches?: boolean
  disableBrowserFetching?: boolean
  concurrency?: number
  failTestcafeOnDiff?: boolean
  tapDirPath?: string
  showLogs?: boolean
}

export function transformConfig<TSpec extends SpecType>(
  options: TestCafeConfiguration,
): eyes.ConfigurationPlain<TSpec> {
  const config: eyes.ConfigurationPlain<TSpec> = {...(options as any)}
  if (options.concurrency) config.concurrentSessions = options.concurrency
  if (options.envName) {
    config.environmentName = options.envName
    delete (config as any).envName
  }
  if (options.browser) {
    config.browsersInfo = utils.types.isArray(options.browser) ? options.browser : [options.browser]
    delete (config as any).browser
  }
  if (
    options.batchId ||
    options.batchName ||
    options.notifyOnCompletion ||
    process.env.APPLITOOLS_NOTIFY_ON_COMPLETION
  ) {
    config.batch = {
      id: options.batchId,
      name: options.batchName,
      notifyOnCompletion: options.notifyOnCompletion || !!process.env.APPLITOOLS_NOTIFY_ON_COMPLETION,
    }
    delete (config as any).batchId
    delete (config as any).batchName
    delete (config as any).notifyOnCompletion
  }
  if (options.matchLevel || options.ignoreCaret || options.ignoreDisplacements || options.accessibilityValidation) {
    config.defaultMatchSettings = {
      ignoreCaret: options.ignoreCaret,
      matchLevel: options.matchLevel,
      ignoreDisplacements: options.ignoreDisplacements,
      accessibilitySettings: options.accessibilityValidation,
    }
    delete (config as any).ignoreCaret
    delete (config as any).matchLevel
    delete (config as any).ignoreDisplacements
    delete (config as any).accessibilityValidation
  }
  if (utils.types.isString(options.proxy)) {
    config.proxy = {url: options.proxy}
  }
  return config
}

export function transformCheckSettings<TSpec extends SpecType>(
  options: TestCafeCheckSettings<TSpec>,
): eyes.CheckSettingsAutomationPlain<TSpec> {
  const settings: eyes.CheckSettingsAutomationPlain<TSpec> = {...options}
  settings.name = options.tag
  settings.hooks = options.scriptHooks
  settings.fully = options.fully ?? options.target !== 'region'
  if (options.target && options.target === 'region' && options.selector) {
    settings.region = options.selector
  }
  if (options.accessibility) {
    const accessibilityRegions = utils.types.isArray(options.accessibility)
      ? options.accessibility
      : [options.accessibility]
    settings.accessibilityRegions = accessibilityRegions.map(accessibilityRegion => {
      const {accessibilityType, ...region} = accessibilityRegion
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return {region: region.selector, accessibilityType}
      } else {
        return {region, accessibilityType}
      }
    })
  }
  if (options.floating) {
    const floatingRegions = utils.types.isArray(options.floating) ? options.floating : [options.floating]
    settings.floatingRegions = <any>floatingRegions.map(floatingRegion => {
      const {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, ...region} = floatingRegion
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, region: region.selector}
      } else {
        return {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, region}
      }
    })
  }
  if (options.ignore) {
    const ignoreRegions = utils.types.isArray(options.ignore) ? options.ignore : [options.ignore]
    settings.ignoreRegions = <any>ignoreRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }
  if (options.layout) {
    const layoutRegions = utils.types.isArray(options.layout) ? options.layout : [options.layout]
    settings.layoutRegions = <any>layoutRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }
  if (options.strict) {
    const strictRegions = utils.types.isArray(options.strict) ? options.strict : [options.strict]
    settings.strictRegions = <any>strictRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }
  if (options.content) {
    const contentRegions = utils.types.isArray(options.content) ? options.content : [options.content]
    settings.contentRegions = <any>contentRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }

  return settings
}
