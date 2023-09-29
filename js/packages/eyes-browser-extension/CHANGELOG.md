# Changelog

## [0.3.15](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension-v0.3.14...js/eyes-browser-extension@0.3.15) (2023-09-29)


### Bug Fixes

* avoid service worker shutdown ([#1830](https://github.com/applitools/eyes.sdk.javascript1/issues/1830)) ([f552d84](https://github.com/applitools/eyes.sdk.javascript1/commit/f552d8425778f300cad31c0297a04f3f282f34e0))


### Code Refactoring

* refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))


### Dependencies

* @applitools/spec-driver-webdriver bumped to 1.0.47

* @applitools/spec-driver-selenium bumped to 1.5.61

* @applitools/spec-driver-puppeteer bumped to 1.2.3

* @applitools/driver bumped to 1.14.3
  #### Bug Fixes

  * force native on get environment ([#1939](https://github.com/applitools/eyes.sdk.javascript1/issues/1939)) ([f42854e](https://github.com/applitools/eyes.sdk.javascript1/commit/f42854eacc769751447204143cb4d50113edc732))
* @applitools/screenshoter bumped to 3.8.13
  #### Bug Fixes

  * force native on get environment ([#1939](https://github.com/applitools/eyes.sdk.javascript1/issues/1939)) ([f42854e](https://github.com/applitools/eyes.sdk.javascript1/commit/f42854eacc769751447204143cb4d50113edc732))



* @applitools/nml-client bumped to 1.5.13

* @applitools/ec-client bumped to 1.7.12
  #### Bug Fixes

  * change expiration time of the tunnel ([c019241](https://github.com/applitools/eyes.sdk.javascript1/commit/c0192411410135b23f3ae47dd62fbef67be66f1a))


  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))
  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/core-base bumped to 1.7.1
  #### Bug Fixes

  * send domMapping payload with correct content encoding ([2bc8e39](https://github.com/applitools/eyes.sdk.javascript1/commit/2bc8e390de1d147d84d1de24df337b8652547b6a))
* @applitools/core bumped to 3.11.5

* @applitools/eyes bumped to 1.10.0
  #### Features

  * added more iOS devices ([a84311f](https://github.com/applitools/eyes.sdk.javascript1/commit/a84311f88e6f532268543a96f841ae5ad87d5659))
  * rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))


  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))



* @applitools/spec-driver-playwright bumped to 1.3.28

* @applitools/spec-driver-browser-extension bumped to 1.0.13


## [0.3.13](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension-v0.3.12...js/eyes-browser-extension@0.3.13) (2023-09-25)


### Bug Fixes

* avoid service worker shutdown ([#1830](https://github.com/applitools/eyes.sdk.javascript1/issues/1830)) ([f552d84](https://github.com/applitools/eyes.sdk.javascript1/commit/f552d8425778f300cad31c0297a04f3f282f34e0))


### Code Refactoring

* refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))


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



* @applitools/spec-driver-webdriver bumped to 1.0.46

* @applitools/spec-driver-selenium bumped to 1.5.60

* @applitools/spec-driver-playwright bumped to 1.3.27
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/spec-driver-puppeteer bumped to 1.2.2
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/driver bumped to 1.14.2
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/screenshoter bumped to 3.8.12

* @applitools/nml-client bumped to 1.5.12
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/tunnel-client bumped to 1.2.3
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/ufg-client bumped to 1.9.2
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/ec-client bumped to 1.7.10
  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/core-base bumped to 1.6.1
  #### Reverts

  * perform major changes ([994cd70](https://github.com/applitools/eyes.sdk.javascript1/commit/994cd703ebe891bf68aecd49d77b5fb119f6ebe8))


  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/core bumped to 3.11.2
  #### Reverts

  * perform major changes ([994cd70](https://github.com/applitools/eyes.sdk.javascript1/commit/994cd703ebe891bf68aecd49d77b5fb119f6ebe8))


  #### Code Refactoring

  * use Uint8Array instead of Buffer for binary data representation ([#1928](https://github.com/applitools/eyes.sdk.javascript1/issues/1928)) ([d1472ab](https://github.com/applitools/eyes.sdk.javascript1/commit/d1472ab8fd49e9a240e99a44dbf1d180b6c7a54b))



* @applitools/spec-driver-browser-extension bumped to 1.0.12

* @applitools/eyes bumped to 1.9.1


## [0.3.11](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension@0.3.10...js/eyes-browser-extension@0.3.11) (2023-09-12)


### Dependencies

* @applitools/core bumped to 3.10.4
  #### Bug Fixes

  * update dom-snapshot to support xml pages and parens inside css URLs ([0715d56](https://github.com/applitools/eyes.sdk.javascript1/commit/0715d56c675b23be017c1985cbba3a51aba052b1))
* @applitools/eyes bumped to 1.8.4


## [0.3.10](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension-v0.3.9...js/eyes-browser-extension@0.3.10) (2023-09-11)


### Bug Fixes

* avoid service worker shutdown ([#1830](https://github.com/applitools/eyes.sdk.javascript1/issues/1830)) ([f552d84](https://github.com/applitools/eyes.sdk.javascript1/commit/f552d8425778f300cad31c0297a04f3f282f34e0))


### Code Refactoring

* refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))


### Dependencies

* @applitools/core bumped to 3.10.3
  #### Bug Fixes

  * suppport coded regions with layoutBreakpoints reload ([7903347](https://github.com/applitools/eyes.sdk.javascript1/commit/79033472b9475992a44cf3828ff334c958ae2066))
* @applitools/eyes bumped to 1.8.3


## [0.3.8](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension@0.3.7...js/eyes-browser-extension@0.3.8) (2023-09-04)


### Dependencies

* @applitools/utils bumped to 1.6.0
  #### Features

  * add support for fallback in `req` ([#1899](https://github.com/applitools/eyes.sdk.javascript1/issues/1899)) ([d69c4b5](https://github.com/applitools/eyes.sdk.javascript1/commit/d69c4b5830370c471dfc25b6e2caddca8b458df9))
* @applitools/socket bumped to 1.1.10

* @applitools/req bumped to 1.6.0
  #### Features

  * add support for fallback in `req` ([#1899](https://github.com/applitools/eyes.sdk.javascript1/issues/1899)) ([d69c4b5](https://github.com/applitools/eyes.sdk.javascript1/commit/d69c4b5830370c471dfc25b6e2caddca8b458df9))
  * update testcafe ([#1884](https://github.com/applitools/eyes.sdk.javascript1/issues/1884)) ([104f1b6](https://github.com/applitools/eyes.sdk.javascript1/commit/104f1b6cc0d4f107ba46404383de2fa11fe99dcf))



* @applitools/image bumped to 1.1.5

* @applitools/spec-driver-webdriver bumped to 1.0.44

* @applitools/spec-driver-selenium bumped to 1.5.58

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

* @applitools/spec-driver-playwright bumped to 1.3.25

* @applitools/spec-driver-browser-extension bumped to 1.0.10

* @applitools/screenshoter bumped to 3.8.10

* @applitools/nml-client bumped to 1.5.10

* @applitools/tunnel-client bumped to 1.2.2

* @applitools/ec-client bumped to 1.7.7

* @applitools/core-base bumped to 1.5.3

* @applitools/core bumped to 3.10.1

* @applitools/eyes bumped to 1.8.1


## [0.3.7](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension@0.3.6...js/eyes-browser-extension@0.3.7) (2023-08-30)


### Dependencies

* @applitools/utils bumped to 1.5.2
  #### Bug Fixes

  * fixed some types ([498b1d7](https://github.com/applitools/eyes.sdk.javascript1/commit/498b1d7c547df04773b64b66ee39cccb402c093e))
* @applitools/nml-client bumped to 1.5.9
  #### Bug Fixes

  * update broker url when server respond with error ([#1882](https://github.com/applitools/eyes.sdk.javascript1/issues/1882)) ([ab5a6ae](https://github.com/applitools/eyes.sdk.javascript1/commit/ab5a6ae8976b061bda8b56a9cc11c149e47d6dea))



* @applitools/core bumped to 3.10.0
  #### Features

  * allowed running multiple classic test with different devices for applitoolsified native apps  ([#1891](https://github.com/applitools/eyes.sdk.javascript1/issues/1891)) ([a84311f](https://github.com/applitools/eyes.sdk.javascript1/commit/a84311f88e6f532268543a96f841ae5ad87d5659))



* @applitools/socket bumped to 1.1.9

* @applitools/eyes bumped to 1.8.0
  #### Features

  * added more iOS devices ([a84311f](https://github.com/applitools/eyes.sdk.javascript1/commit/a84311f88e6f532268543a96f841ae5ad87d5659))



* @applitools/logger bumped to 2.0.9

* @applitools/req bumped to 1.5.4

* @applitools/image bumped to 1.1.4

* @applitools/spec-driver-webdriver bumped to 1.0.43

* @applitools/spec-driver-selenium bumped to 1.5.57

* @applitools/spec-driver-playwright bumped to 1.3.24

* @applitools/spec-driver-puppeteer bumped to 1.1.74

* @applitools/spec-driver-browser-extension bumped to 1.0.9

* @applitools/driver bumped to 1.13.6

* @applitools/screenshoter bumped to 3.8.9

* @applitools/tunnel-client bumped to 1.2.1

* @applitools/ufg-client bumped to 1.7.2

* @applitools/ec-client bumped to 1.7.6

* @applitools/core-base bumped to 1.5.2


## [0.3.6](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension@0.3.5...js/eyes-browser-extension@0.3.6) (2023-08-18)


### Code Refactoring

* refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))


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



* @applitools/spec-driver-playwright bumped to 1.3.23
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))



* @applitools/spec-driver-puppeteer bumped to 1.1.73
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))



* @applitools/spec-driver-browser-extension bumped to 1.0.8
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



* @applitools/eyes bumped to 1.7.3
  #### Code Refactoring

  * refactored spec driver interface ([#1839](https://github.com/applitools/eyes.sdk.javascript1/issues/1839)) ([aa49ec2](https://github.com/applitools/eyes.sdk.javascript1/commit/aa49ec2a7d14b8529acc3a8a4c2baecfa113d98a))




## [0.3.5](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-browser-extension-v0.3.4...js/eyes-browser-extension@0.3.5) (2023-08-10)


### Bug Fixes

* avoid service worker shutdown ([#1830](https://github.com/applitools/eyes.sdk.javascript1/issues/1830)) ([f552d84](https://github.com/applitools/eyes.sdk.javascript1/commit/f552d8425778f300cad31c0297a04f3f282f34e0))


### Dependencies

* @applitools/spec-driver-playwright bumped to 1.3.22
  #### Bug Fixes

  * avoid service worker shutdown ([#1830](https://github.com/applitools/eyes.sdk.javascript1/issues/1830)) ([f552d84](https://github.com/applitools/eyes.sdk.javascript1/commit/f552d8425778f300cad31c0297a04f3f282f34e0))
* @applitools/spec-driver-browser-extension bumped to 1.0.7


## 0.2.0 - 2021/8/13

- support richer core api for throwing errors
- updated to @applitools/eyes-sdk-core@12.22.4 (from 12.21.3)
- updated to @applitools/utils@1.2.2 (from 1.2.0)
- updated to @applitools/visual-grid-client@15.8.18 (from 15.8.13)
- updated to @applitools/eyes-sdk-core@12.22.5 (from 12.22.4)
- updated to @applitools/visual-grid-client@15.8.19 (from 15.8.18)

## 0.1.8 - 2021/7/12

- try to fix build:zip + ability to provide external extension path for demo

## 0.1.7 - 2021/7/12

- fix setEyes, setManager, StaleElementReferenceError, and add demo script

## 0.1.6 - 2021/7/9

- rename makeEyes to openEyes

## 0.1.5 - 2021/7/9

- add build zip command

## 0.1.4 - 2021/7/9

- new version

## 0.1.3 - 2021/7/9

- initial impl
- updated to @applitools/eyes-sdk-core@12.21.3 (from 12.15.0)
- updated to @applitools/visual-grid-client@15.8.13 (from 15.6.0)

## 0.0.1

- create package
