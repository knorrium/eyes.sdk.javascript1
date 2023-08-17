// @ts-nocheck

declare namespace Applitools {
  namespace WebdriverIO {
    interface Browser extends globalThis.WebdriverIO.Browser {}
    interface Element extends globalThis.WebdriverIO.Element {}
    type Selector = string | import('webdriverio').ElementFunction | import('webdriverio').CustomStrategyReference
  }
}