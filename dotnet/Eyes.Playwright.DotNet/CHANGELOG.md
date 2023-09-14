# Changelog

## [1.21](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.20...dotnet/playwright@1.21) (2023-09-14)

### Dependencies

* Eyes.Images bumped to 3.44

  #### Features

  * Added `LocatorSettings` static class to shorten locator settings creation code.

* Eyes.Image.Core bumped to 3.11.0

* js/core bumped to 3.11.0

  #### Features

  * change cache to support distributed cache ([#1913](https://github.com/applitools/eyes.sdk.javascript1/issues/1913)) ([32cc257](https://github.com/applitools/eyes.sdk.javascript1/commit/32cc2574500ac512167f4199c456d8b0349954f7))

  #### Bug Fixes

  * upgrade dom-capture to get font-family in DOM ([f62cee4](https://github.com/applitools/eyes.sdk.javascript1/commit/f62cee495ba3b301dda04160e4e13c7e380ef40b))

* @applitools/ufg-client bumped to 1.9.0
  #### Features

  * change cache to support distributed cache ([#1913](https://github.com/applitools/eyes.sdk.javascript1/issues/1913)) ([32cc257](https://github.com/applitools/eyes.sdk.javascript1/commit/32cc2574500ac512167f4199c456d8b0349954f7))

## [1.20](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.19...dotnet/playwright@1.20) (2023-09-12)

### Bug Fixes

* Fixed `BatchInfo.AddProperty` ([Trello 3280](https://trello.com/c/Z3RpuEns))

### Dependencies

* Eyes.Images bumped to 3.43

  #### Bug Fixes

  * Fixed `BatchInfo.AddProperty` ([Trello 3280](https://trello.com/c/Z3RpuEns))

* Eyes.Image.Core bumped to 3.10.3

* js/core bumped to 3.10.3

  #### Bug Fixes

  * suppport coded regions with layoutBreakpoints reload ([7903347](https://github.com/applitools/eyes.sdk.javascript1/commit/79033472b9475992a44cf3828ff334c958ae2066))


## [1.19](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.18...dotnet/playwright@1.19) (2023-08-27)

### Dependencies

* Eyes.Images bumped to 3.42

  #### Features

  * Added support for ScreenshotMode

* Eyes.Image.Core bumped to 3.9.1

* js/core bumped to 3.9.1

  #### Bug Fixes

  * optimize driver usage in close ([#1867](https://github.com/applitools/eyes.sdk.javascript1/issues/1867)) ([60dff6b](https://github.com/applitools/eyes.sdk.javascript1/commit/60dff6b160e69d3893c91a1125d668fa18b43072))

  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/utils bumped to 1.5.1
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))
* @applitools/logger bumped to 2.0.8
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/socket bumped to 1.1.8
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/req bumped to 1.5.3
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/image bumped to 1.1.3
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/snippets bumped to 2.4.23
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))
* @applitools/spec-driver-webdriver bumped to 1.0.42
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/spec-driver-selenium bumped to 1.5.56
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/spec-driver-puppeteer bumped to 1.1.73
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/driver bumped to 1.13.5
  #### Bug Fixes

  * optimize driver usage in close ([#1867](https://github.com/applitools/eyes.sdk.javascript1/issues/1867)) ([60dff6b](https://github.com/applitools/eyes.sdk.javascript1/commit/60dff6b160e69d3893c91a1125d668fa18b43072))

  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/screenshoter bumped to 3.8.8
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/nml-client bumped to 1.5.8
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/tunnel-client bumped to 1.2.0
  #### Features

  * replace and destroy tunnels by tunnel id ([#1878](https://github.com/applitools/eyes.sdk.javascript1/issues/1878)) ([22bcc15](https://github.com/applitools/eyes.sdk.javascript1/commit/22bcc15b31457e3da56cdb6f73bee3dcb7e051a1))

  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/ufg-client bumped to 1.7.1
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/ec-client bumped to 1.7.5
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

* @applitools/core-base bumped to 1.5.1
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))

## [1.18](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.17...dotnet/playwright@1.18) (2023-08-17)

### Dependencies

* Eyes.Images bumped to 3.41

* Eyes.Image.Core bumped to 3.9.0

* js/core bumped to 3.9.0

  #### Features

  * re-release ([e62abc7](https://github.com/applitools/eyes.sdk.javascript1/commit/e62abc7e74ea0e193eb7770036ae7f97bd11188a))

  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))

* @applitools/nml-client bumped to 1.5.7
  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))

## [1.17](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.16...dotnet/playwright@1.17) (2023-08-11)

### Dependencies

* Eyes.Images bumped to 3.40

* Eyes.Image.Core bumped to 3.9.0

* js/core bumped to 3.9.0

  #### Features

  * re-release ([e62abc7](https://github.com/applitools/eyes.sdk.javascript1/commit/e62abc7e74ea0e193eb7770036ae7f97bd11188a))

  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))

* @applitools/nml-client bumped to 1.5.7
  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))




## [1.16](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.15...dotnet/playwright@1.16) (2023-08-09)

### Dependencies

* Eyes.Images bumped to 3.39

* Eyes.Image.Core bumped to 3.6.6

* js/core bumped to 3.6.6

  #### Bug Fixes

  * populate log event settings with env vars ([#1840](https://github.com/applitools/eyes.sdk.javascript1/issues/1840)) ([0a6af60](https://github.com/applitools/eyes.sdk.javascript1/commit/0a6af60b5b988f59b7adb03f6606b3417fbeb537))

* @applitools/core-base bumped to 1.5.0
  #### Features

  * add stuck request retries to all requests to UFG and Eyes ([#1826](https://github.com/applitools/eyes.sdk.javascript1/issues/1826)) ([5884d42](https://github.com/applitools/eyes.sdk.javascript1/commit/5884d428b230e3a832a2110a388ebe63a94006fc))
  * mark session as component ([#1841](https://github.com/applitools/eyes.sdk.javascript1/issues/1841)) ([c579bb6](https://github.com/applitools/eyes.sdk.javascript1/commit/c579bb69de8f3bffc64e73ac8bd4fa646e96eb01))

  #### Bug Fixes

  * populate log event settings with env vars ([#1840](https://github.com/applitools/eyes.sdk.javascript1/issues/1840)) ([0a6af60](https://github.com/applitools/eyes.sdk.javascript1/commit/0a6af60b5b988f59b7adb03f6606b3417fbeb537))
* @applitools/driver bumped to 1.13.4
  #### Bug Fixes

  * extract device orientation from a browser for web executions ([d8d4e91](https://github.com/applitools/eyes.sdk.javascript1/commit/d8d4e919965fb9105915e762c397ec2cc57a8a71))

* @applitools/snippets bumped to 2.4.22
  #### Bug Fixes

  * improve orientation extraction for ios devices ([378d989](https://github.com/applitools/eyes.sdk.javascript1/commit/378d9894e4fbc7247087ccb8c46266dc4737e2e5))
* @applitools/ufg-client bumped to 1.6.0
  #### Features

  * add stuck request retries to all requests to UFG and Eyes ([#1826](https://github.com/applitools/eyes.sdk.javascript1/issues/1826)) ([5884d42](https://github.com/applitools/eyes.sdk.javascript1/commit/5884d428b230e3a832a2110a388ebe63a94006fc))

  #### Bug Fixes

  * improve fetch error experience when fetching from tunnel ([e7d8b49](https://github.com/applitools/eyes.sdk.javascript1/commit/e7d8b49947c07beb27f110cb4952e8c3206469af))
* @applitools/ec-client bumped to 1.7.4

* @applitools/spec-driver-webdriver bumped to 1.0.41

* @applitools/nml-client bumped to 1.5.6

* @applitools/spec-driver-webdriverio bumped to 1.5.10

* @applitools/screenshoter bumped to 3.8.7

* @applitools/spec-driver-puppeteer bumped to 1.1.72

* @applitools/spec-driver-selenium bumped to 1.5.55

## [1.15](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.14...dotnet/playwright@1.15) (2023-07-31)

### Dependencies

* dotnet/Eyes.Images bumped to 3.38
  ### Bug Fixes
  
  * debug screenshots support

## [1.14](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.13...dotnet/playwright@1.14) (2023-07-30)

### Dependencies

* dotnet/Eyes.Images bumped to 3.37

* dotnet/Eyes.Image.Core bumped to 3.6.5

* @applitools/core bumped to 3.6.5
  #### Bug Fixes

  * rendering issue with chrome &gt;113 and css white-space property ([cf34ad1](https://github.com/applitools/eyes.sdk.javascript1/commit/cf34ad1a5b3cba0b29b3509616b20a2b1313c62f))

* @applitools/ufg-client bumped to 1.5.3
  #### Bug Fixes

  * consider response headers and status code which are returned from the EC resource handler ([#1823](https://github.com/applitools/eyes.sdk.javascript1/issues/1823)) ([b7bd541](https://github.com/applitools/eyes.sdk.javascript1/commit/b7bd5415ae8f92a8032fc68ba993ccac1d9ff76a))
* com.applitools:eyes-universal-core bumped to 5.63.4


## [1.13](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.12...dotnet/playwright@1.13) (2023-07-27)

### Dependencies

* dotnet/Eyes.Images bumped to 3.36

* dotnet/Eyes.Image.Core bumped to 3.6.4

* @applitools/core bumped to 3.6.4
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/core-base bumped to 1.4.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/image bumped to 1.1.2
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/logger bumped to 2.0.7
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/req bumped to 1.5.2
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/driver bumped to 1.13.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/ec-client bumped to 1.7.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/socket bumped to 1.1.7
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/spec-driver-webdriver bumped to 1.0.40
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/tunnel-client bumped to 1.1.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/nml-client bumped to 1.5.5
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/spec-driver-webdriverio bumped to 1.5.9
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/screenshoter bumped to 3.8.6
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/ufg-client bumped to 1.5.2
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/spec-driver-puppeteer bumped to 1.1.71
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

* @applitools/spec-driver-selenium bumped to 1.5.54
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))


## [1.12](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.11...dotnet/playwright@1.12) (2023-07-18)
### Updated
- Match to latest Eyes.Images

## [1.11](https://github.com/applitools/eyes.sdk.javascript1/compare/dotnet/playwright@1.10...dotnet/playwright@1.11) (2023-07-14)
### Updated
- Match to latest Eyes.Images

## [1.10](https://github.com/applitools/eyes.sdk.javascript1/releases/tag/dotnet/playwright@1.10) (2023-07-13)
### Updated
- Match to latest Eyes.Images

## [1.9] (2023-07-11)
### Updated
- Match to latest Eyes.Images

## [1.8] (2023-07-10)
### Updated
- Match to latest Eyes.Images

## [1.7] (2023-07-09)
### Updated
- Match to latest Eyes.Images

## [1.6] (2023-07-06)
### Updated
- Match to latest Eyes.Images

## [1.5] (2023-07-02)
### Updated
- Match to latest Eyes.Images

## [1.4] (2023-06-27)
### Updated
- Match to latest Eyes.Images

## [1.3] (2023-06-20)
### Updated
- Version number bump

## [1.1] (2023-06-14)
### Updated
- Match to latest Eyes.Images

## [1.0] (NEW)
### Added
- DotNet Playwright support.
- Server Core version 3.2.1.
