# Changelog

## [3.43.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.43.1...js/eyes-storybook@3.43.2) (2023-09-30)


### Bug Fixes

* bump ([756e2d6](https://github.com/applitools/eyes.sdk.javascript1/commit/756e2d6899b58dfa69001d70133230447b4794d3))

## [3.43.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.43.0...js/eyes-storybook@3.43.1) (2023-09-29)


### Dependencies

* @applitools/driver bumped to 1.14.3
  #### Bug Fixes

  * force native on get environment ([#1939](https://github.com/applitools/eyes.sdk.javascript1/issues/1939)) ([f42854e](https://github.com/applitools/eyes.sdk.javascript1/commit/f42854eacc769751447204143cb4d50113edc732))
* @applitools/screenshoter bumped to 3.8.13
  #### Bug Fixes

  * force native on get environment ([#1939](https://github.com/applitools/eyes.sdk.javascript1/issues/1939)) ([f42854e](https://github.com/applitools/eyes.sdk.javascript1/commit/f42854eacc769751447204143cb4d50113edc732))



* @applitools/ec-client bumped to 1.7.12
  #### Bug Fixes

  * change expiration time of the tunnel ([c019241](https://github.com/applitools/eyes.sdk.javascript1/commit/c0192411410135b23f3ae47dd62fbef67be66f1a))


  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))
  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/core-base bumped to 1.7.1
  #### Bug Fixes

  * send domMapping payload with correct content encoding ([2bc8e39](https://github.com/applitools/eyes.sdk.javascript1/commit/2bc8e390de1d147d84d1de24df337b8652547b6a))
* @applitools/spec-driver-webdriver bumped to 1.0.47

* @applitools/spec-driver-selenium bumped to 1.5.61

* @applitools/spec-driver-puppeteer bumped to 1.2.3

* @applitools/nml-client bumped to 1.5.13

* @applitools/core bumped to 3.11.5


## [3.43.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook-v3.42.2...js/eyes-storybook@3.43.0) (2023-09-28)


### Features

* add support for passing a DOM mapping file to deobfuscate RCA ([8c99f8d](https://github.com/applitools/eyes.sdk.javascript1/commit/8c99f8da53ded229306fe2f3da89cb3b5691e2c0))
* rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))
* show aborted tests in Eyes dashboard ([#1877](https://github.com/applitools/eyes.sdk.javascript1/issues/1877)) ([f9840d4](https://github.com/applitools/eyes.sdk.javascript1/commit/f9840d494222ccc6c6f262896771e28da2565bc6))
* update puppeteer version and minimum node version ([#1889](https://github.com/applitools/eyes.sdk.javascript1/issues/1889)) ([d449030](https://github.com/applitools/eyes.sdk.javascript1/commit/d449030bed6bf4f4c3e7a0dcb6f3ec78f7623e4c))


### Bug Fixes

* update timeout when rendering stories with variants and legacy ([00b8499](https://github.com/applitools/eyes.sdk.javascript1/commit/00b8499716827518fe24abe5031ef950f0254119))


### Dependencies

* @applitools/core-base bumped to 1.7.0
  #### Features

  * add support for passing a DOM mapping file to deobfuscate RCA ([8c99f8d](https://github.com/applitools/eyes.sdk.javascript1/commit/8c99f8da53ded229306fe2f3da89cb3b5691e2c0))
* @applitools/ec-client bumped to 1.7.11

* @applitools/core bumped to 3.11.4


## [3.42.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.42.0...js/eyes-storybook@3.42.1) (2023-09-26)


### Bug Fixes

* update timeout when rendering stories with variants and legacy ([00b8499](https://github.com/applitools/eyes.sdk.javascript1/commit/00b8499716827518fe24abe5031ef950f0254119))

## [3.42.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook-v3.41.3...js/eyes-storybook@3.42.0) (2023-09-25)


### Features

* rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))
* show aborted tests in Eyes dashboard ([#1877](https://github.com/applitools/eyes.sdk.javascript1/issues/1877)) ([f9840d4](https://github.com/applitools/eyes.sdk.javascript1/commit/f9840d494222ccc6c6f262896771e28da2565bc6))
* update puppeteer version and minimum node version ([#1889](https://github.com/applitools/eyes.sdk.javascript1/issues/1889)) ([d449030](https://github.com/applitools/eyes.sdk.javascript1/commit/d449030bed6bf4f4c3e7a0dcb6f3ec78f7623e4c))


### Dependencies

* @applitools/utils bumped to 1.6.1
  #### Bug Fixes

  * add browser entry point declaration and test ([#1933](https://github.com/applitools/eyes.sdk.javascript1/issues/1933)) ([5ba0720](https://github.com/applitools/eyes.sdk.javascript1/commit/5ba0720d62a9af8a9a2e1c2437c569e6ab19afd8))


  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))
* @applitools/logger bumped to 2.0.11
  #### Bug Fixes

  * add browser entry point declaration and test ([#1933](https://github.com/applitools/eyes.sdk.javascript1/issues/1933)) ([5ba0720](https://github.com/applitools/eyes.sdk.javascript1/commit/5ba0720d62a9af8a9a2e1c2437c569e6ab19afd8))



* @applitools/socket bumped to 1.1.11
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/req bumped to 1.6.1
  #### Bug Fixes

  * add browser entry point declaration and test ([#1933](https://github.com/applitools/eyes.sdk.javascript1/issues/1933)) ([5ba0720](https://github.com/applitools/eyes.sdk.javascript1/commit/5ba0720d62a9af8a9a2e1c2437c569e6ab19afd8))



* @applitools/image bumped to 1.1.6
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/driver bumped to 1.14.2
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/tunnel-client bumped to 1.2.3
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/ec-client bumped to 1.7.10
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/spec-driver-webdriver bumped to 1.0.46

* @applitools/spec-driver-puppeteer bumped to 1.2.2
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/nml-client bumped to 1.5.12
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/ufg-client bumped to 1.9.2
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/core-base bumped to 1.6.1
  #### Reverts

  * perform major changes ([994cd70](https://github.com/applitools/eyes.sdk.javascript1/commit/994cd703ebe891bf68aecd49d77b5fb119f6ebe8))


  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/spec-driver-selenium bumped to 1.5.60

* @applitools/screenshoter bumped to 3.8.12

* @applitools/core bumped to 3.11.2
  #### Reverts

  * perform major changes ([994cd70](https://github.com/applitools/eyes.sdk.javascript1/commit/994cd703ebe891bf68aecd49d77b5fb119f6ebe8))


  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))




## [3.41.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.41.1...js/eyes-storybook@3.41.2) (2023-09-12)


### Dependencies

* @applitools/core bumped to 3.10.4
  #### Bug Fixes

  * update dom-snapshot to support xml pages and parens inside css URLs ([0715d56](https://github.com/applitools/eyes.sdk.javascript1/commit/0715d56c675b23be017c1985cbba3a51aba052b1))

## [3.41.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.41.0...js/eyes-storybook@3.41.1) (2023-09-11)


### Dependencies

* @applitools/core bumped to 3.10.3
  #### Bug Fixes

  * suppport coded regions with layoutBreakpoints reload ([7903347](https://github.com/applitools/eyes.sdk.javascript1/commit/79033472b9475992a44cf3828ff334c958ae2066))

## [3.41.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.40.0...js/eyes-storybook@3.41.0) (2023-09-05)


### Features

* show aborted tests in Eyes dashboard ([#1877](https://github.com/applitools/eyes.sdk.javascript1/issues/1877)) ([f9840d4](https://github.com/applitools/eyes.sdk.javascript1/commit/f9840d494222ccc6c6f262896771e28da2565bc6))


### Dependencies

* @applitools/core-base bumped to 1.6.0
  #### Features

  * show aborted tests in Eyes dashboard ([#1877](https://github.com/applitools/eyes.sdk.javascript1/issues/1877)) ([f9840d4](https://github.com/applitools/eyes.sdk.javascript1/commit/f9840d494222ccc6c6f262896771e28da2565bc6))
* @applitools/ec-client bumped to 1.7.8

* @applitools/core bumped to 3.10.2


## [3.40.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook-v3.39.1...js/eyes-storybook@3.40.0) (2023-09-04)


### Features

* rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))
* update puppeteer version and minimum node version ([#1889](https://github.com/applitools/eyes.sdk.javascript1/issues/1889)) ([d449030](https://github.com/applitools/eyes.sdk.javascript1/commit/d449030bed6bf4f4c3e7a0dcb6f3ec78f7623e4c))


### Dependencies

* @applitools/utils bumped to 1.6.0
  #### Features

  * add support for fallback in `req` ([#1899](https://github.com/applitools/eyes.sdk.javascript1/issues/1899)) ([d69c4b5](https://github.com/applitools/eyes.sdk.javascript1/commit/d69c4b5830370c471dfc25b6e2caddca8b458df9))
* @applitools/req bumped to 1.6.0
  #### Features

  * add support for fallback in `req` ([#1899](https://github.com/applitools/eyes.sdk.javascript1/issues/1899)) ([d69c4b5](https://github.com/applitools/eyes.sdk.javascript1/commit/d69c4b5830370c471dfc25b6e2caddca8b458df9))
  * update testcafe ([#1884](https://github.com/applitools/eyes.sdk.javascript1/issues/1884)) ([104f1b6](https://github.com/applitools/eyes.sdk.javascript1/commit/104f1b6cc0d4f107ba46404383de2fa11fe99dcf))



* @applitools/spec-driver-puppeteer bumped to 1.2.0
  #### Features

  * update testcafe ([#1884](https://github.com/applitools/eyes.sdk.javascript1/issues/1884)) ([104f1b6](https://github.com/applitools/eyes.sdk.javascript1/commit/104f1b6cc0d4f107ba46404383de2fa11fe99dcf))



* @applitools/driver bumped to 1.14.0
  #### Features

  * update testcafe ([#1884](https://github.com/applitools/eyes.sdk.javascript1/issues/1884)) ([104f1b6](https://github.com/applitools/eyes.sdk.javascript1/commit/104f1b6cc0d4f107ba46404383de2fa11fe99dcf))



* @applitools/ufg-client bumped to 1.8.0
  #### Features

  * add support for fallback in `req` ([#1899](https://github.com/applitools/eyes.sdk.javascript1/issues/1899)) ([d69c4b5](https://github.com/applitools/eyes.sdk.javascript1/commit/d69c4b5830370c471dfc25b6e2caddca8b458df9))



* @applitools/logger bumped to 2.0.10

* @applitools/socket bumped to 1.1.10

* @applitools/image bumped to 1.1.5

* @applitools/spec-driver-webdriver bumped to 1.0.44

* @applitools/spec-driver-selenium bumped to 1.5.58

* @applitools/screenshoter bumped to 3.8.10

* @applitools/nml-client bumped to 1.5.10

* @applitools/tunnel-client bumped to 1.2.2

* @applitools/ec-client bumped to 1.7.7

* @applitools/core-base bumped to 1.5.3

* @applitools/core bumped to 3.10.1


## [3.39.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.38.3...js/eyes-storybook@3.39.0) (2023-08-25)


### Features

* update puppeteer version and minimum node version ([#1889](https://github.com/applitools/eyes.sdk.javascript1/issues/1889)) ([d449030](https://github.com/applitools/eyes.sdk.javascript1/commit/d449030bed6bf4f4c3e7a0dcb6f3ec78f7623e4c))

## [3.38.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.38.2...js/eyes-storybook@3.38.3) (2023-08-18)


### Dependencies

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



* @applitools/core bumped to 3.9.1
  #### Bug Fixes

  * optimize driver usage in close ([#1867](https://github.com/applitools/eyes.sdk.javascript1/issues/1867)) ([60dff6b](https://github.com/applitools/eyes.sdk.javascript1/commit/60dff6b160e69d3893c91a1125d668fa18b43072))


  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))




## [3.38.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.38.1...js/eyes-storybook@3.38.2) (2023-08-10)


### Dependencies

* @applitools/nml-client bumped to 1.5.7
  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))
* @applitools/core bumped to 3.9.0
  #### Features

  * re-release ([e62abc7](https://github.com/applitools/eyes.sdk.javascript1/commit/e62abc7e74ea0e193eb7770036ae7f97bd11188a))


  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))




## [3.38.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.38.0...js/eyes-storybook@3.38.1) (2023-08-08)


### Dependencies

* @applitools/core bumped to 3.8.1
  #### Bug Fixes

  * some fix ([5dc537a](https://github.com/applitools/eyes.sdk.javascript1/commit/5dc537aa5d40933c21f21b8f138f7ff944c064a8))

## [3.38.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.8...js/eyes-storybook@3.38.0) (2023-08-08)


### Features

* rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))


### Dependencies

* @applitools/core bumped to 3.8.0
  #### Features

  * rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))

## [3.37.8](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.7...js/eyes-storybook@3.37.8) (2023-08-08)


### Dependencies

* @applitools/ufg-client bumped to 1.7.0
  #### Features

  * allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))
* @applitools/core bumped to 3.7.0
  #### Features

  * allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))




## [3.37.7](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.6...js/eyes-storybook@3.37.7) (2023-08-03)


### Dependencies

* @applitools/core bumped to 3.6.6
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


## [3.37.6](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.5...js/eyes-storybook@3.37.6) (2023-07-27)


### Dependencies

* @applitools/core bumped to 3.6.5
  #### Bug Fixes

  * rendering issue with chrome &gt;113 and css white-space property ([cf34ad1](https://github.com/applitools/eyes.sdk.javascript1/commit/cf34ad1a5b3cba0b29b3509616b20a2b1313c62f))



* @applitools/ufg-client bumped to 1.5.3
  #### Bug Fixes

  * consider response headers and status code which are returned from the EC resource handler ([#1823](https://github.com/applitools/eyes.sdk.javascript1/issues/1823)) ([b7bd541](https://github.com/applitools/eyes.sdk.javascript1/commit/b7bd5415ae8f92a8032fc68ba993ccac1d9ff76a))

## [3.37.5](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.4...js/eyes-storybook@3.37.5) (2023-07-24)


### Bug Fixes

* wait for initializationPromise ([#1628](https://github.com/applitools/eyes.sdk.javascript1/issues/1628)) ([01c528a](https://github.com/applitools/eyes.sdk.javascript1/commit/01c528ac9379239c445018f1c12d87a7b404e214))

## [3.37.4](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.3...js/eyes-storybook@3.37.4) (2023-07-21)


### Bug Fixes

* fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))


### Dependencies

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




## [3.37.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.2...js/eyes-storybook@3.37.3) (2023-07-21)


### Code Refactoring

* ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))


### Dependencies



## [3.37.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.1...js/eyes-storybook@3.37.2) (2023-07-18)


### Performance Improvements

* additional runtime improvements ([8a33a83](https://github.com/applitools/eyes.sdk.javascript1/commit/8a33a83d4911bdd3bebff646c983d5a2de512763))

## [3.37.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.37.0...js/eyes-storybook@3.37.1) (2023-07-18)


### Performance Improvements

* improve runtime performance ([#1763](https://github.com/applitools/eyes.sdk.javascript1/issues/1763)) ([3efcc85](https://github.com/applitools/eyes.sdk.javascript1/commit/3efcc85df1d8ec09884bd6bae26758cc4d649f97))

## [3.37.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook@3.36.0...js/eyes-storybook@3.37.0) (2023-07-18)


### Features

* support retries on stuck requests ([#1773](https://github.com/applitools/eyes.sdk.javascript1/issues/1773)) ([4db470e](https://github.com/applitools/eyes.sdk.javascript1/commit/4db470ee6829c13cfaf7e521ef91e20854266edd))


### Bug Fixes

* fix lint config and remove extranous deps ([aea605c](https://github.com/applitools/eyes.sdk.javascript1/commit/aea605c4a1d6cca37d84b464af369cdbff3c6234))


### Dependencies

* @applitools/req bumped from 1.4.0 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))
* @applitools/ufg-client bumped from 1.4.1 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))



* @applitools/core bumped to 3.6.2

* @applitools/core-base bumped from 1.4.0 to 1.4.1

* @applitools/ec-client bumped from 1.7.0 to 1.7.1

* @applitools/tunnel-client bumped from 1.1.0 to 1.1.1

* @applitools/nml-client bumped from 1.5.2 to 1.5.3


## [3.36.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-storybook-v3.35.1...js/eyes-storybook@3.36.0) (2023-07-05)


### Features

* added support for storybook installed in parent module ([#1060](https://github.com/applitools/eyes.sdk.javascript1/issues/1060)) ([e2b9fbb](https://github.com/applitools/eyes.sdk.javascript1/commit/e2b9fbbb41938b2363a2c675874ad28e41859076))
* support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))


### Dependencies

* @applitools/core bumped from 3.4.0 to 3.5.0
  #### Features

  * added auto applitools lib detection ([#1707](https://github.com/applitools/eyes.sdk.javascript1/issues/1707)) ([7d439b5](https://github.com/applitools/eyes.sdk.javascript1/commit/7d439b52af55f3b0596c9d35d6ba85c717448023))
  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))


  #### Bug Fixes

  * some fix ([660a137](https://github.com/applitools/eyes.sdk.javascript1/commit/660a1376a49dd28f8f399690502cd3d1f77665fa))



* @applitools/core-base bumped from 1.2.1 to 1.3.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))



* @applitools/req bumped from 1.3.3 to 1.4.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))
* @applitools/driver bumped from 1.12.4 to 1.13.0
  #### Features

  * added auto applitools lib detection ([#1707](https://github.com/applitools/eyes.sdk.javascript1/issues/1707)) ([7d439b5](https://github.com/applitools/eyes.sdk.javascript1/commit/7d439b52af55f3b0596c9d35d6ba85c717448023))
* @applitools/ec-client bumped from 1.5.0 to 1.6.0
  #### Features

  * added support of regional execution cloud servers ([#1711](https://github.com/applitools/eyes.sdk.javascript1/issues/1711)) ([2e26c69](https://github.com/applitools/eyes.sdk.javascript1/commit/2e26c6944bb15f6121fb37c1dba95aba162c1f6a))
  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))


  #### Bug Fixes

  * fixed auto tunnel cleanup after unexpected end of the process ([3c1ad08](https://github.com/applitools/eyes.sdk.javascript1/commit/3c1ad0837d2d3560becc6d89370aa878becb3270))



* @applitools/tunnel-client bumped from 0.1.1 to 1.0.0
  #### Features

  * added binaries and made them available in jfrog ([92033fe](https://github.com/applitools/eyes.sdk.javascript1/commit/92033fed7edc58bbc4a4e37269068418fe3afc3d))
  * release as 1.0.0 ([93bf312](https://github.com/applitools/eyes.sdk.javascript1/commit/93bf31205b07d19bc2cb4f50b974c7bad0f49cea))



* @applitools/ufg-client bumped from 1.2.22 to 1.3.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))



* @applitools/spec-driver-webdriver bumped from 1.0.36 to 1.0.37

* @applitools/nml-client bumped from 1.5.0 to 1.5.1

* @applitools/screenshoter bumped from 3.8.1 to 3.8.2

* @applitools/spec-driver-puppeteer bumped from 1.1.67 to 1.1.68


## 3.35.0 - 2023/6/13

### Features
### Bug fixes
- Add support for variations in storybook 7
- Increase timeout for rendering results polling
- Add the option to not fail on visual differences using exitcode `nodiffs`

## 3.34.2 - 2023/5/16

### Features
- Add support for reloading the page when using layoutBreakpoints
### Bug fixes

## 3.34.1 - 2023/5/9

### Features
### Bug fixes
- Fix the issue where storybook v6 will not start if storybook cli is being used

## 3.34.0 - 2023/5/4

### Features
- Add the option to send a list of browsers from the component configuration
### Bug fixes

## 3.33.1 - 2023/4/26

### Features
### Bug fixes
- Make sure to pass LayoutBreakpoints and WaitBeforeCapture from story config to dom snapshot
- Map UFG config correctly

## 3.33.0 - 2023/4/26

### Features
### Bug fixes
- Fixed `disableBrowserFetching` option behavior

## 3.32.1 - 2023/4/16

### Features
### Bug fixes
- result output throw error

## 3.32.0 - 2023/3/30

### Features
- Add support for configuration per subsets of stories
### Bug fixes
- Improve performance in DOM snapshot

## 3.31.5 - 2023/3/28

### Features
### Bug fixes
- Optimized number of requests during polling
- Write result files without throwing error

## 3.31.4 - 2023/3/17

### Features
### Bug fixes
- Fixed slowness during ufg tests

## 3.31.3 - 2023/3/14

### Features
### Bug fixes
- Update internal dependencies

## 3.31.2 - 2023/3/9

### Features
- Add support for storybook 7
### Bug fixes
- Support running Storybook dev server in Node.js v18

## 3.31.1 - 2023/2/21

### Features
### Bug fixes
- Make sure to send http headers in the main storybook tab

## 3.31.0 - 2023/2/15

### Features
- Crop screenshot image base on account info
- Add the option to send external http headers to Puppeteer Page object
### Bug fixes

## 3.30.2 - 2023/1/23

### Features
### Bug fixes
- Update dependencies

## 3.30.1 - 2023/1/3

### Features
- Additional internal event logs
### Bug fixes
- fixed bug in mobile environment

## 3.30.0 - 2022/12/19

### Features
- Deprecated "Content" match level value in favor of "IgnoreColors"
- Add Support for storyStoreV7 flag
### Bug fixes
- Handle fake shadowRoot with UFG
- Handed error during polling in long requests to eyes server

## 3.29.4 - 2022/9/12

### Features
### Bug fixes
- Prevent Eyes-Storybook from hanging when there is a failure to take DOM

## 3.29.3 - 2022/8/18

### Features
### Bug fixes
- Better support in DOM slot element
- fix error handling

## 3.29.2 - 2022/7/14

### Features
- Allow configuration file to be loaded from ancestor directories
### Bug fixes
- Fixed bug where a failure in a single UFG environment fails all other environments in the same configuration

## 3.29.1 - 2022/6/16

### Features
- Allowed `` values in custom properties
- Add special attribute for pseudo elements
- Support padding for regions in the following region types - ignoreRegions, layoutRegions, strictRegions, contentRegions
### Bug fixes
- Fixed broken links to enums implementation in the README.md
- Fix rendering issues with Salesforce Lightning design system
- Add timeout when attempting to get data for a story

## 3.29.0 - 2022/6/2

### Features
- Dorp support for Node.js versions <=12
### Bug fixes

## 3.28.0 - 2022/5/26

### Features
- Support [Storybook interactions](https://storybook.js.org/docs/react/essentials/interactions). For stories which have a `Play` function defined, the screenshot will be taken automatically after the `Play` flow is done.
### Bug fixes
- added `properties` and `notifyOnCompletion` as optional Types of Batch (for TS)
- Allow running with self-signed certificates

## 3.27.6 - 2022/4/13

### Features
### Bug fixes
- Support data urls in iframes

## 3.27.5 - 2022/3/29

### Features
- Preserve search parameters in Storybook URLs
### Bug fixes

## 3.27.4 - 2022/2/9

- updated to @applitools/driver@1.4.9 (from 1.4.7)
- updated to @applitools/eyes-sdk-core@13.0.0 (from 12.24.9)
- updated to @applitools/logger@1.0.9 (from 1.0.8)
- updated to @applitools/visual-grid-client@15.8.62 (from 15.8.55)
- support adding new test(s) and the value of saveNewTest is false will warn
- README.md update default value of 'exitcode' to 'true' (from 'false')
- updated to @applitools/driver@1.4.12 (from 1.4.9)
- updated to @applitools/eyes-sdk-core@13.0.2 (from 13.0.0)
- updated to @applitools/logger@1.0.10 (from 1.0.9)
- updated to @applitools/visual-grid-client@15.8.63 (from 15.8.62)
- updated to @applitools/utils@1.2.12 (from 1.2.11)

## 3.27.3 - 2022/1/26

- avoid unwanted page reloading due to unknown query parameters
- updated to @applitools/driver@1.4.9 (from 1.4.7)
- updated to @applitools/eyes-sdk-core@13.0.0 (from 12.24.9)
- updated to @applitools/logger@1.0.9 (from 1.0.8)
- updated to @applitools/visual-grid-client@15.8.62 (from 15.8.55)

## 3.27.2 - 2021/12/23

- updated to @applitools/driver@1.4.7 (from 1.4.5)
- updated to @applitools/eyes-sdk-core@12.24.9 (from 12.24.7)
- updated to @applitools/logger@1.0.8 (from 1.0.7)
- updated to @applitools/visual-grid-client@15.8.55 (from 15.8.53)

## 3.27.1 - 2021/12/21

- add support for storybook api 6.4
- updated to @applitools/driver@1.4.5 (from 1.3.5)
- updated to @applitools/eyes-sdk-core@12.24.7 (from 12.24.5)
- updated to @applitools/logger@1.0.7 (from 1.0.6)
- updated to @applitools/test-server@1.0.8 (from 1.0.7)
- updated to @applitools/visual-grid-client@15.8.53 (from 15.8.49)

## 3.27.0 - 2021/12/6

- support custom properties and query params
- remove `queryParams` api from story and global config

## 3.26.1 - 2021/11/28

- add custom test properties to stories with query params

## 3.26.0 - 2021/11/26

- add support for `queryParams` config property
- updated to @applitools/driver@1.3.5 (from 1.2.7)
- updated to @applitools/eyes-puppeteer@1.9.0 (from 1.8.5)
- updated to @applitools/eyes-sdk-core@12.24.5 (from 12.23.24)
- updated to @applitools/logger@1.0.6 (from 1.0.5)
- updated to @applitools/test-server@1.0.7 (from 1.0.6)
- updated to @applitools/visual-grid-client@15.8.49 (from 15.8.43)

 ## 3.25.3 - 2021/11/1

- add a retry mechanism for cases we get 0 stories

## 3.25.2 - 2021/10/30

- replace legacy logger construction with new
- deprecate `waitBeforeScreenshot` and introduce `waitBeforeCapture` instead
- updated to @applitools/driver@1.2.7 (from 1.2.6)
- updated to @applitools/eyes-puppeteer@1.8.5 (from 1.8.4)
- updated to @applitools/eyes-sdk-core@12.23.24 (from 12.23.18)
- updated to @applitools/test-server@1.0.6 (from 1.0.5)
- updated to @applitools/visual-grid-client@15.8.43 (from 15.8.37)

## 3.25.1 - 2021/10/20

- updated to @applitools/eyes-puppeteer@1.8.4 (from 1.8.3)
- updated to @applitools/eyes-sdk-core@12.23.18 (from 12.23.17)
- updated to @applitools/visual-grid-client@15.8.37 (from 15.8.36)

## 3.25.0 - 2021/10/18

- updated to @applitools/driver@1.2.6 (from 1.1.3)
- updated to @applitools/eyes-puppeteer@1.8.3 (from 1.8.2)
- updated to @applitools/eyes-sdk-core@12.23.17 (from 12.23.0)
- updated to @applitools/test-server@1.0.5 (from 1.0.4)
- updated to @applitools/visual-grid-client@15.8.36 (from 15.8.21)

## 3.24.0 - 2021/8/23

- add `startStorybookServerTimeout` config param

## 3.23.1 - 2021/8/23

- add `visualGridOptions`, `useDom`, and `enablePatterns` config params

## 3.23.0 - 2021/8/17

- add `sendDom` config param

## 3.22.11 - 2021/8/16

- updated to @applitools/driver@1.1.3 (from 1.1.2)
- updated to @applitools/eyes-puppeteer@1.8.2 (from 1.8.1)
- updated to @applitools/eyes-sdk-core@12.23.0 (from 12.22.4)
- updated to @applitools/visual-grid-client@15.8.21 (from 15.8.18)

## 3.22.10 - 2021/8/13

- updated to @applitools/dom-snapshot@4.5.7 (from 4.5.6)

## 3.22.9 - 2021/8/12

- upgrade to latest puppeteer
- updated to @applitools/eyes-puppeteer@1.8.1 (from 1.8.0)
- updated to @applitools/eyes-sdk-core@12.22.4 (from 12.22.3)
- updated to @applitools/visual-grid-client@15.8.18 (from 15.8.17)

## 3.22.8 - 2021/8/8

- updated to @applitools/driver@1.1.2 (from 1.1.0)
- updated to @applitools/eyes-puppeteer@1.8.0 (from 1.7.4)
- updated to @applitools/eyes-sdk-core@12.22.3 (from 12.22.1)
- updated to @applitools/test-server@1.0.4 (from 1.0.3)
- updated to @applitools/visual-grid-client@15.8.17 (from 15.8.15)

## 3.22.7 - 2021/8/8

- fix IE execution in parallel
- updated to @applitools/dom-snapshot@4.5.6 (from 4.5.4)
- updated to @applitools/driver@1.1.0 (from 1.0.6)
- updated to @applitools/eyes-sdk-core@12.22.1 (from 12.21.3)
- updated to @applitools/visual-grid-client@15.8.15 (from 15.8.13)

## 3.22.6 - 2021/7/7

- document runBefore and runAfter functions caveats
- updated to @applitools/dom-snapshot@4.5.4 (from 4.5.3)

  ## 3.22.5 - 2021/6/30

 - fail immediately when the api key is invalid 
- updated to @applitools/eyes-puppeteer@1.7.4 (from 1.7.3)
- updated to @applitools/eyes-sdk-core@12.21.3 (from 12.21.2)
- updated to @applitools/visual-grid-client@15.8.13 (from 15.8.12)

## 3.22.4 - 2021/6/29

- fix storybook url `html` extensions
- updated to @applitools/driver@1.0.7 (from 1.0.6)
- updated to @applitools/eyes-sdk-core@12.21.2 (from 12.20.2)
- updated to @applitools/visual-grid-client@15.8.11 (from 15.8.8)
- updated to @applitools/visual-grid-client@15.8.12 (from 15.8.11)
- updated to @applitools/eyes-puppeteer@1.7.3 (from 1.7.2)

## 3.22.3 - 2021/6/1

- fix browser config
- updated to @applitools/dom-snapshot@4.5.3 (from 4.5.0)
- updated to @applitools/eyes-sdk-core@12.20.2 (from 12.20.1)
- updated to @applitools/visual-grid-client@15.8.8 (from 15.8.7)

## 3.22.2 - 2021/5/11

- fix ie browser name

## 3.22.1 - 2021/5/5

- fix no browser config storybook

## 3.22.0 - 2021/5/2

- render on fake IE browser
- updated to @applitools/eyes-puppeteer@1.6.0 (from 1.4.3)
- updated to @applitools/eyes-sdk-core@12.17.4 (from 12.17.2)
- updated to @applitools/visual-grid-client@15.8.2 (from 15.8.0)

## 3.21.0 - 2021/4/22

- updated to @applitools/dom-snapshot@4.5.0 (from 4.4.14)
- updated to @applitools/eyes-sdk-core@12.17.2 (from 12.16.2)
- updated to @applitools/visual-grid-client@15.8.0 (from 15.6.3)

## 3.20.2 - 2021/3/22

- Fix regression with `concurrency` that was introduced in version 3.17.1

## 3.20.1 - 2021/3/17

- Handle story parameters with circular reference better

  ## 3.20.0 - 2021/3/17

 - added runAfter hook 
- updated to @applitools/dom-snapshot@4.4.14 (from 4.4.11)
- updated to @applitools/eyes-sdk-core@12.16.2 (from 12.15.0)
- updated to @applitools/visual-grid-client@15.6.3 (from 15.6.0)

## 3.19.0 - 2021/3/4

- support passing a string or regex to the include configuration

## 3.18.0 - 2021/2/26

- support `ignoreGitMergeBase`
- updated to @applitools/eyes-sdk-core@12.15.0 (from 12.14.11)
- updated to @applitools/visual-grid-client@15.6.0 (from 15.5.22)

## 3.17.1 - 2021/2/24

- fix concurrency message condition
- add `include` documentation
- updated to @applitools/eyes-sdk-core@12.14.11 (from 12.14.10)

## 3.17.0 - 2021/2/23

- don't auto-populate the batch name when not specified ([Trello](https://trello.com/c/MGGJ3Rh8))
- updated to @applitools/dom-snapshot@4.4.11 (from 4.4.10)
- updated to @applitools/eyes-sdk-core@12.14.10 (from 12.14.6)
- updated to @applitools/visual-grid-client@15.5.22 (from 15.5.19)

## 3.16.5 - 2021/1/31

- updated to @applitools/dom-snapshot@4.4.10 (from 4.4.9)
- updated to @applitools/eyes-sdk-core@12.14.6 (from 12.14.5)
- updated to @applitools/visual-grid-client@15.5.19 (from 15.5.17)

## 3.16.4 - 2021/1/31

- chore: add husky
- updated to @applitools/dom-snapshot@4.4.9 (from 4.4.7)
- updated to @applitools/eyes-puppeteer@1.4.3 (from 1.4.2)
- updated to @applitools/eyes-sdk-core@12.14.5 (from 12.13.4)
- updated to @applitools/visual-grid-client@15.5.17 (from 15.5.10)

## 3.16.3 - 2021/1/15

- updated to @applitools/dom-snapshot@4.4.7 (from 4.4.5)
- updated to @applitools/eyes-puppeteer@1.4.2 (from 1.4.0)
- updated to @applitools/eyes-sdk-core@12.13.4 (from 12.12.2)
- updated to @applitools/visual-grid-client@15.5.10 (from 15.5.5)

## 3.16.2 - 2021/1/12

- updated to @applitools/dom-snapshot@4.4.5 (from 4.4.4)

## 3.16.1 - 2021/1/10

- updated to @applitools/dom-snapshot@4.4.4 (from 4.4.1)
- updated to @applitools/eyes-sdk-core@12.12.2 (from 12.11.0)
- updated to @applitools/visual-grid-client@15.5.5 (from 15.5.0)

## 3.16.0 - 2020/12/30

- support JS layout
- updated to @applitools/eyes-sdk-core@12.11.0 (from 12.10.0)
- updated to @applitools/visual-grid-client@15.5.0 (from 15.4.0)

## 3.15.0 - 2020/12/18

- updated to @applitools/eyes-puppeteer@1.4.0 (from 1.3.1)
- updated to @applitools/eyes-sdk-core@12.10.0 (from 12.9.3)
- updated to @applitools/visual-grid-client@15.4.0 (from 15.3.2)

## 3.14.2 - 2020/12/15

- updated to @applitools/dom-snapshot@4.4.1 (from 4.4.0)
- updated to @applitools/eyes-puppeteer@1.3.1 (from 1.3.0)
- updated to @applitools/eyes-sdk-core@12.9.3 (from 12.9.2)
- updated to @applitools/visual-grid-client@15.3.2 (from 15.3.1)

## 3.14.1 - 2020/12/14

- updated to @applitools/dom-snapshot@4.4.0 (from 4.3.1)
- updated to @applitools/eyes-puppeteer@1.3.0 (from 1.2.2)
- updated to @applitools/eyes-sdk-core@12.9.2 (from 12.9.1)
- updated to @applitools/visual-grid-client@15.3.1 (from 15.3.0)

## 3.14.0 - 2020/12/11

- updated to @applitools/dom-snapshot@4.3.1 (from 4.2.9)
- updated to @applitools/eyes-sdk-core@12.9.1 (from 12.8.3)
- updated to @applitools/visual-grid-client@15.3.0 (from 15.2.4)

## 3.13.4 - 2020/12/4

- updated to @applitools/eyes-puppeteer@1.2.2 (from 1.2.1)
- updated to @applitools/eyes-sdk-core@12.8.3 (from 12.8.2)
- updated to @applitools/visual-grid-client@15.2.4 (from 15.2.3)

## 3.13.3 - 2020/12/4

- updated to @applitools/visual-grid-client@15.2.3 (from 15.2.2)

## 3.13.2 - 2020/12/4

- updated to @applitools/dom-snapshot@4.2.9 (from 4.2.8)
- updated to @applitools/eyes-puppeteer@1.2.1 (from 1.2.0)

## 3.13.1 - 2020/12/3

- updated to @applitools/dom-snapshot@4.2.8 (from 4.2.7)
- updated to @applitools/eyes-sdk-core@12.8.2 (from 12.8.1)
- updated to @applitools/visual-grid-client@15.2.2 (from 15.2.1)

- fix `saveFailedTests`

## 3.13.0 - 2020/12/2

- use eyes-puppeteer SDK for running dom-snapshot - adds support for cross-origin iframes [Trello 635](https://trello.com/c/TgiAqTUM) and [Trello 551](https://trello.com/c/wPl3ef7y))
- updated to @applitools/eyes-puppeteer@1.2.0 (from 1.1.1)
- updated to @applitools/eyes-sdk-core@12.8.1 (from 12.6.2)

## 3.12.1 - 2020/11/26

- updated to @applitools/eyes-sdk-core@12.6.2 (from 12.6.0)
- updated to @applitools/visual-grid-client@15.2.1 (from 15.2.0)

## 3.12.0 - 2020/11/19

- updated to @applitools/dom-snapshot@4.2.7 (from 4.2.6)
- updated to @applitools/eyes-sdk-core@12.6.0 (from 12.5.7)
- updated to @applitools/visual-grid-client@15.2.0 (from 15.1.1)

## 3.11.0 - 2020/11/13

- updated to @applitools/dom-snapshot@4.2.6 (from 4.2.4)
- updated to @applitools/eyes-sdk-core@12.5.7 (from 12.5.4)
- updated to @applitools/visual-grid-client@15.1.1 (from 15.0.16)

## 3.10.1 - 2020/10/28

- support indeterminate checkboxes
- updated to @applitools/dom-snapshot@4.2.4 (from 4.2.2)
- updated to @applitools/eyes-sdk-core@12.5.4 (from 12.4.4)
- updated to @applitools/visual-grid-client@15.0.16 (from 15.0.12)

## 3.10.0 - 2020/10/19

- deprecate `saveDebugData`
- updated to @applitools/eyes-sdk-core@12.4.4 (from 12.4.3)
- updated to @applitools/visual-grid-client@15.0.12 (from 15.0.11)

## 3.9.2 - 2020/10/18

- updated to @applitools/dom-snapshot@4.2.2 (from 4.2.1)
- updated to @applitools/eyes-sdk-core@12.4.3 (from 12.4.2)
- updated to @applitools/visual-grid-client@15.0.11 (from 15.0.10)

## 3.9.1 - 2020/10/14

- add iosVersion to readme
- updated to @applitools/dom-snapshot@4.2.1 (from 4.2.0)
- updated to @applitools/eyes-sdk-core@12.4.2 (from 12.3.1)
- updated to @applitools/visual-grid-client@15.0.10 (from 15.0.9)

## 3.9.0 - 2020/10/12

- updated to @applitools/dom-snapshot@4.2.0 (from 4.1.1)
- updated to @applitools/eyes-sdk-core@12.3.1 (from 12.2.9)
- updated to @applitools/visual-grid-client@15.0.9 (from 15.0.8)

## 3.8.11 - 2020/10/1

- added "See details at..." at the beginning
- updated to @applitools/dom-snapshot@4.1.1 (from 4.1.0)

## 3.8.10 - 2020/9/28

- remove yarn workspaces
- updated to @applitools/dom-snapshot@4.1.0 (from 4.0.6)
- updated to @applitools/eyes-sdk-core@12.2.6 (from 12.2.5)
- updated to @applitools/visual-grid-client@15.0.6 (from 15.0.5)
- updated to @applitools/eyes-sdk-core@12.2.9 (from 12.2.6)
- updated to @applitools/visual-grid-client@15.0.8 (from 15.0.6)

## 3.8.9 - 2020/8/31

- fix exception when getStoryData throws an error ([Trello](https://trello.com/c/FLDMYl2O))
- updated to @applitools/eyes-sdk-core@12.2.0 (from 12.1.4)
- updated to @applitools/visual-grid-client@15.0.0 (from 14.7.5)

## 3.8.8 - 2020/8/13

- updated to @applitools/eyes-sdk-core@12.1.4 (from 12.1.0)
- updated to @applitools/visual-grid-client@14.7.5 (from 14.7.1)

## 3.8.7 - 2020/8/9

- updated to @applitools/dom-snapshot@4.0.3 (from 4.0.1)
- updated to @applitools/eyes-sdk-core@12.1.0 (from 11.5.1)
- updated to @applitools/visual-grid-client@14.7.1 (from 14.6.2)
- add JSON file output [PR 224](https://github.com/applitools/eyes.sdk.javascript1/pull/224)

## 3.8.6 - 2020/7/30

- updated to @applitools/dom-snapshot@4.0.1 (from 4.0.0)
- updated to @applitools/eyes-sdk-core@11.5.1 (from 11.5.0)
- updated to @applitools/visual-grid-client@14.6.2 (from 14.6.0)

## 3.8.5 - 2020/7/26

- updated to @applitools/dom-snapshot@4.0.0 (from 3.7.2)
- updated to @applitools/eyes-sdk-core@11.5.0 (from 11.3.9)
- updated to @applitools/visual-grid-client@14.6.0 (from 14.5.13)

## 3.8.4 - 2020/7/22

- updated to @applitools/dom-snapshot@3.7.2 (from 3.7.1)
- updated to @applitools/eyes-sdk-core@11.3.9 (from 11.3.7)
- updated to @applitools/visual-grid-client@14.5.13 (from 14.5.11)

## 3.8.3 - 2020/7/17

- add ios device info to readme
- updated to @applitools/dom-snapshot@3.7.1 (from 3.6.0)
- updated to @applitools/eyes-sdk-core@11.3.7 (from 11.1.0)
- updated to @applitools/visual-grid-client@14.5.11 (from 14.5.0)

## 3.8.2 - 2020/6/29

- updated to @applitools/dom-snapshot@3.6.0 (from 3.5.3)
- updated to @applitools/eyes-sdk-core@11.1.0 (from 11.0.5)
- updated to @applitools/visual-grid-client@14.5.0 (from 14.4.4)

## 3.8.1 - 2020/6/29

- released erroneously

## 3.8.0 - 2020/6/9

- updated to @applitools/dom-snapshot@3.5.3 (from 3.5.2)
- updated to @applitools/eyes-sdk-core@11.0.5 (from 11.0.3)
- updated to @applitools/visual-grid-client@14.4.4 (from 14.4.2)

## 3.7.1 - 2020/6/3

- fixed 409 conflict error
- Unified core
- updated to @applitools/eyes-sdk-core@11.0.3 (from v10.3.1)
- updated to @applitools/visual-grid-client@14.4.2 (from v14.3.1)

## 3.7.0 - 2020/5/24

- add ability to render tests results to XUnit XML (per [Trello 261](https://trello.com/c/ozmI1rav))
- updated to @applitools/eyes-sdk-core@10.3.0
- updated to @applitools/visual-grid-client@14.2.0

## 3.6.0 - 2020/5/19

- Support for AccessibilityGuidelinesVersion
- updated to @applitools/dom-snapshot@3.5.2
- updated to @applitools/eyes-sdk-core@10.2.0
- updated to @applitools/visual-grid-client@14.1.0

## 3.5.3 - 2020/5/4

- changed console output to contain story data on errors
- updated to @applitools/dom-snapshot@3.5.0
- updated to @applitools/eyes-sdk-core@10.0.1
- updated to @applitools/visual-grid-client@13.7.6

## 3.5.2 - 2020/4/27

- add edgechromium to types
- updated to @applitools/visual-grid-client@13.7.2

## 3.5.1 - 2020/4/27

- add edgechromium to readme

## 3.5.0 - 2020/4/26

- support edgelegacy, edgechromium, and edgechromium-one-version-back
- updated to @applitools/dom-snapshot@3.4.5
- updated to @applitools/eyes-sdk-core@9.2.1
- updated to @applitools/visual-grid-client@13.7.1

## 3.4.0 - 2020/4/1

- Add capability to specify `ignoreDisplacements` (both via global and local configuration). ([Trello](https://trello.com/c/IfkEZ4V3/45-storybook-add-set-get-ignoredisplacements-to-eyes-global-and-fluent))
- Add capability to specify Layout, Strict, Content, Floating regions (both via global and local configuration). ([Trello](https://trello.com/c/NNko9uQr/200-storybook-add-capability-to-add-layout-strict-content-floating-regions-via-the-config))
- Add capability to specify custom properties (both via global and local configuration) ([Trello](https://trello.com/c/yWbAZ2Fm/170-storybook-sdk-custom-properties-support))

## 3.3.3 - 2020/3/31

- removed eyes-common dependency

## 3.3.2

- avoid unnecessary requests to get batchInfo (due to wrong `isGeneratedId` value on batchInfo)

## 3.3.1

- update @applitools/dom-snapshot@3.4.0 to get correct css in DOM snapshots ([Trello](https://trello.com/c/3BFtM4hx/188-hidden-spinners-in-text-field-are-visible-in-firefox), [Trello](https://trello.com/c/S4XT7ONp/192-vg-dom-snapshot-deletes-duplicate-keys-from-css-rules), [Trello](https://trello.com/c/mz8CKKB7/173-selector-not-seen-as-it-should-be-issue-with-css-variable), [Trello](https://trello.com/c/KZ25vktg/245-edge-screenshot-different-from-chrome-and-ff))

## 3.3.0

- Add `viewportSize` parameter to control the puppeteer browser size ([Trello](https://trello.com/c/lGEGpIZI/237-bad-rendering-of-element-storybook))

## 3.2.14

- Support both new and old server versions for identifying new running sessions. ([Trello](https://trello.com/c/mtSiheZ9/267-support-startsession-as-long-running-task))

## 3.2.13

- dom snapshot log for fetched resources now shows the byte length that was fetched [Trello](https://trello.com/c/CjSvn1OQ/262-storybook-409-conflict-wrong-sha)

## 3.2.12

- dom snapshot error while fetching is now always in clear text [Trello](https://trello.com/c/Jx1VJgpA/258-gap-storybook-assets-not-loading)

## 3.2.11

- fix trying to fetch branch info from server on non github integration runs
- support future long running tasks [Trello](https://trello.com/c/60Rm4xXG/240-support-future-long-running-tasks)
