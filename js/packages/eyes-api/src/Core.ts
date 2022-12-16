import type {
  Core,
  EyesManager,
  Eyes,
  ImageTarget,
  Config,
  CheckSettings,
  TestResultSummary,
  TestResultContainer,
  TestResult,
} from '@applitools/core'

export type CoreSpec<TDriver = unknown, TElement = unknown, TSelector = unknown> = Core<
  TDriver,
  unknown,
  TElement,
  TSelector
>

export type CoreEyes<TDriver = unknown, TElement = unknown, TSelector = unknown> = Eyes<
  TDriver,
  unknown,
  TElement,
  TSelector,
  'classic' | 'ufg'
>

export type CoreEyesManager<TDriver = unknown, TElement = unknown, TSelector = unknown> = EyesManager<
  TDriver,
  unknown,
  TElement,
  TSelector,
  'classic' | 'ufg'
>

export type CoreTargetImage = ImageTarget

export type CoreConfig<TElement = unknown, TSelector = unknown> = Config<TElement, TSelector, 'classic'> &
  Config<TElement, TSelector, 'ufg'>

export type CoreCheckSettingsAutomation<TElement = unknown, TSelector = unknown> = CheckSettings<
  TElement,
  TSelector,
  'classic'
> &
  CheckSettings<TElement, TSelector, 'ufg'>

export type CoreCheckSettingsImage = CheckSettings<never, never, 'classic'>

export type CoreTestResultSummary = TestResultSummary<'classic' | 'ufg'>

export type CoreTestResultContainer = TestResultContainer<'classic' | 'ufg'>

export type CoreTestResult = TestResult<'classic' | 'ufg'>
