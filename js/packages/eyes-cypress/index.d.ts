/// <reference types="cypress" />
import type * as api from '@applitools/eyes-api'

type MaybeArray<T> = T | T[]

type LegacyRegion = {left: number; top: number; width: number; height: number}
type Selector = {selector: string; type?: 'css' | 'xpath', nodeType?: 'element' | 'shadow-root'} | 'string'
type Element = HTMLElement | JQuery<HTMLElement>

interface CypressCheckSettings extends api.CheckSettingsAutomationPlain<Element, Selector>{
  tag?: CypressCheckSettings['name']

  target?: 'window' | 'region'
  selector?: Selector
  element?: Element

  ignore?: MaybeArray<NonNullable<CypressCheckSettings['ignoreRegions']>[number] | LegacyRegion>
  layout?: MaybeArray<NonNullable<CypressCheckSettings['layoutRegions']>[number] | LegacyRegion>
  content?: MaybeArray<NonNullable<CypressCheckSettings['contentRegions']>[number] | LegacyRegion>
  strict?: MaybeArray<NonNullable<CypressCheckSettings['strictRegions']>[number] | LegacyRegion>
  floating?: MaybeArray<NonNullable<CypressCheckSettings['floatingRegions']>[number] | (({element: Element} | Selector | LegacyRegion) & {maxUpOffset?: number; maxDownOffset?: number; maxLeftOffset?: number; maxRightOffset?: number})>
  accessibility?: MaybeArray<NonNullable<CypressCheckSettings['accessibilityRegions']>[number] | (({element: Element} | Selector | LegacyRegion) & {accessibilityType?: api.AccessibilityRegionTypePlain})>
  scriptHooks?: CypressCheckSettings['hooks']
  ignoreCaret?: boolean
  ignoreDisplacements?: boolean
}

interface CypressEyesConfig extends api.ConfigurationPlain<Element, Selector> {
  browser?: MaybeArray<NonNullable<CypressEyesConfig['browsersInfo']>[number] | {deviceName: string; screenOrientation?: api.ScreenOrientationPlain; name?: string}>

  batchId?:  NonNullable<CypressEyesConfig['batch']>['id']
  batchName?:  NonNullable<CypressEyesConfig['batch']>['name']
  batchSequence?:  NonNullable<CypressEyesConfig['batch']>['sequenceName']
  notifyOnCompletion?:  NonNullable<CypressEyesConfig['batch']>['notifyOnCompletion']

  envName?: CypressEyesConfig['environmentName']

  accessibilitySettings?: NonNullable<CypressEyesConfig['defaultMatchSettings']>['accessibilitySettings']
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Create an Applitools test.
       * This will start a session with the Applitools server.
       * @example
       * cy.eyesOpen({ appName: 'My App' })
      */
      eyesOpen(config?: CypressEyesConfig): null

      /**
       * Generate a screenshot of the current page and add it to the Applitools Test.
       * @example
       * cy.eyesCheckWindow()
       *
       * OR
       *
       * cy.eyesCheckWindow({
       *  target: 'region',
       *  selector: '.my-element'
       * });
      */
      eyesCheckWindow(tag?: string): null
      eyesCheckWindow(settings?: CypressCheckSettings): null

      /**
       * Close the applitools test and check that all screenshots are valid.
       * @example cy.eyesClose()
      */
      eyesClose(): null

      /**
       * Returns an object with the applitools test results from a given test / test file. This should be called after close.
       * @example
       * after(() => {
       *  cy.eyesGetAllTestResults().then(summary => {
       *    console.log(summary)
       *  })
       * })
       */
      eyesGetAllTestResults(): Chainable<api.TestResultsSummary>
    }
  }
}