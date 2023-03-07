// @ts-nocheck

type WDIOBrowser = import('webdriverio').Browser
type WDIOElement = import('webdriverio').Element

declare namespace Applitools {
  namespace WebdriverIO {
    interface Browser extends WDIOBrowser {}
    interface Element extends WDIOElement {}
    type Selector = string | ((element: HTMLElement) => HTMLElement) | ((element: HTMLElement) => HTMLElement[])
  }
}
