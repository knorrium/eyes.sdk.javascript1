# Changelog

## [1.7.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.7.1...js/eyes@1.7.2) (2023-08-10)


### Dependencies

* @applitools/nml-client bumped to 1.5.7
  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))
* @applitools/core bumped to 3.9.0
  #### Features

  * re-release ([e62abc7](https://github.com/applitools/eyes.sdk.javascript1/commit/e62abc7e74ea0e193eb7770036ae7f97bd11188a))


  #### Bug Fixes

  * propagate stitch mode to applitools lib ([a2dcedb](https://github.com/applitools/eyes.sdk.javascript1/commit/a2dcedb4bc6b999c137ed2aab43e0a463aa90169))




## [1.7.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.7.0...js/eyes@1.7.1) (2023-08-08)


### Dependencies

* @applitools/core bumped to 3.8.1
  #### Bug Fixes

  * some fix ([5dc537a](https://github.com/applitools/eyes.sdk.javascript1/commit/5dc537aa5d40933c21f21b8f138f7ff944c064a8))

## [1.7.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.7...js/eyes@1.7.0) (2023-08-08)


### Features

* rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))


### Dependencies

* @applitools/core bumped to 3.8.0
  #### Features

  * rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))

## [1.6.7](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-v1.6.6...js/eyes@1.6.7) (2023-08-08)


### Dependencies

* @applitools/ufg-client bumped to 1.7.0
  #### Features

  * allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))
* @applitools/core bumped to 3.7.0
  #### Features

  * allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))




## [1.6.6](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.5...js/eyes@1.6.6) (2023-08-03)


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


## [1.6.5](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.4...js/eyes@1.6.5) (2023-07-27)


### Dependencies

* @applitools/core bumped to 3.6.5
  #### Bug Fixes

  * rendering issue with chrome &gt;113 and css white-space property ([cf34ad1](https://github.com/applitools/eyes.sdk.javascript1/commit/cf34ad1a5b3cba0b29b3509616b20a2b1313c62f))



* @applitools/ufg-client bumped to 1.5.3
  #### Bug Fixes

  * consider response headers and status code which are returned from the EC resource handler ([#1823](https://github.com/applitools/eyes.sdk.javascript1/issues/1823)) ([b7bd541](https://github.com/applitools/eyes.sdk.javascript1/commit/b7bd5415ae8f92a8032fc68ba993ccac1d9ff76a))

## [1.6.4](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.3...js/eyes@1.6.4) (2023-07-21)


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




## [1.6.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.2...js/eyes@1.6.3) (2023-07-21)


### Code Refactoring

* ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))


### Dependencies

* @applitools/req bumped to 1.5.1
  #### Code Refactoring

  * ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))

## [1.6.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.1...js/eyes@1.6.2) (2023-07-18)


### Dependencies

* @applitools/req bumped from 1.4.0 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))
* @applitools/ufg-client bumped from 1.4.1 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))



* @applitools/core bumped from 3.6.1 to 3.6.2

* @applitools/core-base bumped from 1.4.0 to 1.4.1

* @applitools/ec-client bumped from 1.7.0 to 1.7.1

* @applitools/tunnel-client bumped from 1.1.0 to 1.1.1

* @applitools/nml-client bumped from 1.5.2 to 1.5.3


## [1.6.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.6.0...js/eyes@1.6.1) (2023-07-13)


### Bug Fixes

* replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))


### Dependencies

* @applitools/core bumped from 3.6.0 to 3.6.1
  #### Bug Fixes

  * replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))



* @applitools/driver bumped from 1.13.0 to 1.13.1
  #### Bug Fixes

  * replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))
* @applitools/ec-client bumped from 1.6.2 to 1.7.0
  #### Features

  * added internal function to prepare environment before running tunnels ([3d19ec3](https://github.com/applitools/eyes.sdk.javascript1/commit/3d19ec3b274702ffdf26b766b7351ec1f4b66a6d))



* @applitools/tunnel-client bumped from 1.0.2 to 1.1.0
  #### Features

  * added internal function to prepare environment before running tunnels ([3d19ec3](https://github.com/applitools/eyes.sdk.javascript1/commit/3d19ec3b274702ffdf26b766b7351ec1f4b66a6d))


  #### Bug Fixes

  * prevent tunnel binaries from overriding itself ([5609a36](https://github.com/applitools/eyes.sdk.javascript1/commit/5609a36c93622c9b8eeb4b4ab25f95907df8baa4))



* @applitools/nml-client bumped from 1.5.1 to 1.5.2
  #### Bug Fixes

  * replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))



* @applitools/ufg-client bumped from 1.4.0 to 1.4.1
  #### Bug Fixes

  * fixed an issue when an inability to freeze a gif image caused sdk crush ([dca9ead](https://github.com/applitools/eyes.sdk.javascript1/commit/dca9eadd2bab39d1fc20b99d997879075691f0ee))
  * fixed issue when sdk crushed due to invalid resource url in ufg mode ([8b44958](https://github.com/applitools/eyes.sdk.javascript1/commit/8b449580a930753dd2735befdcdb4c46e184b2a9))
* @applitools/spec-driver-webdriver bumped from 1.0.37 to 1.0.38

* @applitools/execution-grid-tunnel bumped to 2.1.8

* @applitools/screenshoter bumped from 3.8.3 to 3.8.4


## [1.6.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.5.2...js/eyes@1.6.0) (2023-07-10)


### Features

* added new chrome emulation devices - `Galaxy S21`, `Galaxy S21 Ultra`, and `Galaxy S22 Ultra` ([0dac7f7](https://github.com/applitools/eyes.sdk.javascript1/commit/0dac7f7941558a4e9416f70a104b96d125d38fc7))


### Bug Fixes

* adjusted behavior of `nmgOptions` property around different screenshot mods ([2709afa](https://github.com/applitools/eyes.sdk.javascript1/commit/2709afa51c98f89d506d901b04454d9f37bacd87))


### Dependencies

* @applitools/core bumped from 3.5.1 to 3.6.0
  #### Features

  * ability to skip deserialize dom snapshot ([#1703](https://github.com/applitools/eyes.sdk.javascript1/issues/1703)) ([a461af4](https://github.com/applitools/eyes.sdk.javascript1/commit/a461af4fb72b7cba1ae15a5d20376fd02e7d9003))
  * prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))
  * support custom property per renderer ([#1715](https://github.com/applitools/eyes.sdk.javascript1/issues/1715)) ([8cf6b1f](https://github.com/applitools/eyes.sdk.javascript1/commit/8cf6b1fb0563b2485ca18eebc2efd236c2287db8))



* @applitools/core-base bumped from 1.3.0 to 1.4.0
  #### Features

  * support custom property per renderer ([#1715](https://github.com/applitools/eyes.sdk.javascript1/issues/1715)) ([8cf6b1f](https://github.com/applitools/eyes.sdk.javascript1/commit/8cf6b1fb0563b2485ca18eebc2efd236c2287db8))



* @applitools/image bumped from 1.0.36 to 1.1.0
  #### Features

  * prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))
* @applitools/ec-client bumped from 1.6.1 to 1.6.2
  #### Bug Fixes

  * fixed issue that caused creation of unnecessary tunnels ([b38fe37](https://github.com/applitools/eyes.sdk.javascript1/commit/b38fe3754f97c5f312ceffd74406255654466ab7))
  * start tunnels with proper regional server ([2a34ed8](https://github.com/applitools/eyes.sdk.javascript1/commit/2a34ed8cd72dc9ac54957348cbe8ba9e67032340))



* @applitools/tunnel-client bumped from 1.0.1 to 1.0.2
  #### Bug Fixes

  * start tunnels with proper regional server ([2a34ed8](https://github.com/applitools/eyes.sdk.javascript1/commit/2a34ed8cd72dc9ac54957348cbe8ba9e67032340))
* @applitools/ufg-client bumped from 1.3.0 to 1.4.0
  #### Features

  * ability to skip deserialize dom snapshot ([#1703](https://github.com/applitools/eyes.sdk.javascript1/issues/1703)) ([a461af4](https://github.com/applitools/eyes.sdk.javascript1/commit/a461af4fb72b7cba1ae15a5d20376fd02e7d9003))
  * add support for resource fetching through eg tunnel ([3daa4da](https://github.com/applitools/eyes.sdk.javascript1/commit/3daa4da975cbe23ffb33bb3e9f5f76732ead1075))
  * added new chrome emulation devices - `Galaxy S21`, `Galaxy S21 Ultra`, and `Galaxy S22 Ultra` ([0dac7f7](https://github.com/applitools/eyes.sdk.javascript1/commit/0dac7f7941558a4e9416f70a104b96d125d38fc7))
  * prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))


  #### Bug Fixes

  * add support for resource fetching through eg tunnel ([a0b98e3](https://github.com/applitools/eyes.sdk.javascript1/commit/a0b98e364cf95bf6bed84c1afe3376384d781717))
  * add support for resource fetching through eg tunnel ([3daa4da](https://github.com/applitools/eyes.sdk.javascript1/commit/3daa4da975cbe23ffb33bb3e9f5f76732ead1075))



* @applitools/screenshoter bumped from 3.8.2 to 3.8.3


## [1.5.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.5.1...js/eyes@1.5.2) (2023-07-05)


### Dependencies

* @applitools/tunnel-client bumped from 1.0.0 to 1.0.1
  #### Bug Fixes

  * re-release ([438a9aa](https://github.com/applitools/eyes.sdk.javascript1/commit/438a9aa6331ba76d6bdc7d94e8f27d7ae45730da))
* @applitools/core bumped from 3.5.0 to 3.5.1

* @applitools/ec-client bumped from 1.6.0 to 1.6.1


## [1.5.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.5.0...js/eyes@1.5.1) (2023-07-05)


### Bug Fixes

* fixed issue with getResults log appearing in console when file handler configured ([56b75c2](https://github.com/applitools/eyes.sdk.javascript1/commit/56b75c2185906c1581980985816a000c14000ac3))


### Reverts

* revert removal of `nmgOptions` api ([b8d03c7](https://github.com/applitools/eyes.sdk.javascript1/commit/b8d03c77e8243397ecca233e46d56f7437d16df4))


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


## [1.5.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.4.1...js/eyes@1.5.0) (2023-06-29)


### Features

* added a new mode for taking native app screenshots ([#1682](https://github.com/applitools/eyes.sdk.javascript1/issues/1682)) ([0ab7d96](https://github.com/applitools/eyes.sdk.javascript1/commit/0ab7d96164c89ec65b87654fb271d4404bbf70e5))


### Dependencies

* @applitools/core bumped from 3.3.1 to 3.4.0
  #### Features

  * added a new mode for taking native app screenshots ([#1682](https://github.com/applitools/eyes.sdk.javascript1/issues/1682)) ([0ab7d96](https://github.com/applitools/eyes.sdk.javascript1/commit/0ab7d96164c89ec65b87654fb271d4404bbf70e5))


  #### Bug Fixes

  * apply default scrolling mode ([f35aba4](https://github.com/applitools/eyes.sdk.javascript1/commit/f35aba454a344c8f0cf787afa2120ce57d91e307))



* @applitools/nml-client bumped from 1.4.0 to 1.5.0
  #### Features

  * added a new mode for taking native app screenshots ([#1682](https://github.com/applitools/eyes.sdk.javascript1/issues/1682)) ([0ab7d96](https://github.com/applitools/eyes.sdk.javascript1/commit/0ab7d96164c89ec65b87654fb271d4404bbf70e5))

## [1.4.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.4.0...js/eyes@1.4.1) (2023-06-28)


### Dependencies

* @applitools/ec-client bumped from 1.4.0 to 1.5.0
  #### Features

  * bump `execution-grid-tunnel` to 2.1.6 ([2840ddf](https://github.com/applitools/eyes.sdk.javascript1/commit/2840ddfc08518495d3a5ba58c33569c213a0eac3))



* @applitools/tunnel-client bumped from 0.1.0 to 0.1.1
  #### Bug Fixes

  * bump `execution-grid-tunnel` to 2.1.6 in tunnel-client ([54f4824](https://github.com/applitools/eyes.sdk.javascript1/commit/54f48249c4d82936366fbd4df5f77a74ffc1b6b4))
* @applitools/core bumped from 3.3.0 to 3.3.1


## [1.4.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.3.1...js/eyes@1.4.0) (2023-06-28)


### Features

* added a new mode for taking native app screenshots ([#1665](https://github.com/applitools/eyes.sdk.javascript1/issues/1665)) ([6237db7](https://github.com/applitools/eyes.sdk.javascript1/commit/6237db7a6212d6c84542f2a5bf9b120e758a7a4b))


### Bug Fixes

* fixed default agentId ([7e49fbe](https://github.com/applitools/eyes.sdk.javascript1/commit/7e49fbe69bebe63e8d8fa3c55b36b00a7c41f604))


### Dependencies

* @applitools/core bumped from 3.2.5 to 3.3.0
  #### Features

  * added a new mode for taking native app screenshots ([#1665](https://github.com/applitools/eyes.sdk.javascript1/issues/1665)) ([6237db7](https://github.com/applitools/eyes.sdk.javascript1/commit/6237db7a6212d6c84542f2a5bf9b120e758a7a4b))


  #### Bug Fixes

  * **js/core:** rerelease ([43c4e89](https://github.com/applitools/eyes.sdk.javascript1/commit/43c4e8987a53ecf6db883122c0f3acb7adcd3e14))



* @applitools/nml-client bumped from 1.3.59 to 1.4.0
  #### Features

  * added a new mode for taking native app screenshots ([#1665](https://github.com/applitools/eyes.sdk.javascript1/issues/1665)) ([6237db7](https://github.com/applitools/eyes.sdk.javascript1/commit/6237db7a6212d6c84542f2a5bf9b120e758a7a4b))

## [1.3.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.3.0...js/eyes@1.3.1) (2023-06-28)


### Dependencies

* @applitools/utils bumped from 1.4.0 to 1.5.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))
* @applitools/ec-client bumped from 1.3.0 to 1.4.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))


  #### Bug Fixes

  * remove content type when request doesn't contain any body ([354e877](https://github.com/applitools/eyes.sdk.javascript1/commit/354e8779af9e0be2d9ec1f321acd312862448f91))



* @applitools/tunnel-client bumped from 0.0.5 to 0.1.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))



* @applitools/core bumped from 3.2.4 to 3.2.5

* @applitools/core-base bumped from 1.2.0 to 1.2.1

* @applitools/image bumped from 1.0.35 to 1.0.36

* @applitools/logger bumped from 2.0.4 to 2.0.5

* @applitools/req bumped from 1.3.2 to 1.3.3

* @applitools/driver bumped from 1.12.3 to 1.12.4

* @applitools/socket bumped from 1.1.4 to 1.1.5

* @applitools/spec-driver-webdriver bumped from 1.0.35 to 1.0.36

* @applitools/nml-client bumped from 1.3.58 to 1.3.59

* @applitools/screenshoter bumped from 3.8.0 to 3.8.1

* @applitools/ufg-client bumped from 1.2.21 to 1.2.22


## [1.3.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.2.17...js/eyes@1.3.0) (2023-06-21)


### Features

* added overload for locate method, to call it with custom target ([5d5914a](https://github.com/applitools/eyes.sdk.javascript1/commit/5d5914a5dae6822cde0086d6b9f4d6f9ac7cc4f2))


### Dependencies

* @applitools/core bumped from 3.2.3 to 3.2.4
  #### Bug Fixes

  * fix coverage tests ([f5067d8](https://github.com/applitools/eyes.sdk.javascript1/commit/f5067d8693502c3f6c9dbdf8adafbe513d86a9ad))
  * fix tests ([0325ca0](https://github.com/applitools/eyes.sdk.javascript1/commit/0325ca07a57949714f04eb008d269fe0726486b6))



* @applitools/logger bumped from 2.0.3 to 2.0.4
  #### Bug Fixes

  * fixed issue when extended logger didn't preserve base's handler ([7c5e029](https://github.com/applitools/eyes.sdk.javascript1/commit/7c5e0299522f792aad72b7b3827df31a1ab2d68f))

## [1.2.17](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.2.16...js/eyes@1.2.17) (2023-06-15)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/core bumped from 3.2.2 to 3.2.3
  * devDependencies
    * @applitools/req bumped from ^1.3.1 to ^1.3.2

## [1.2.16](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes@1.2.15...js/eyes@1.2.16) (2023-06-14)


### Bug Fixes

* **js/eyes:** new feature ([f8b5c23](https://github.com/applitools/eyes.sdk.javascript1/commit/f8b5c23e245e8c08f2595b1f7fea94d971a7b577))

## [1.2.15](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-v1.2.14...js/eyes@1.2.15) (2023-06-13)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/core bumped from 3.2.1 to 3.2.2
    * @applitools/logger bumped from 2.0.2 to 2.0.3
    * @applitools/utils bumped from 1.3.37 to 1.4.0
  * devDependencies
    * @applitools/req bumped from ^1.3.0 to ^1.3.1
