# Changelog

## [1.16.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.17...js/eyes-nightwatch@1.16.0) (2023-08-08)


### Features

* rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))


### Dependencies

* @applitools/core bumped to 3.8.0
  #### Features

  * rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))
* @applitools/eyes bumped to 1.7.0
  #### Features

  * rework log event on opent eyes ([#1842](https://github.com/applitools/eyes.sdk.javascript1/issues/1842)) ([532756b](https://github.com/applitools/eyes.sdk.javascript1/commit/532756b75c1023967c3781316148c890dbcfaac8))




## [1.15.17](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.16...js/eyes-nightwatch@1.15.17) (2023-08-08)


### Dependencies

* @applitools/ufg-client bumped to 1.7.0
  #### Features

  * allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))
* @applitools/core bumped to 3.7.0
  #### Features

  * allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))



* @applitools/eyes bumped to 1.6.7


## [1.15.16](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.15...js/eyes-nightwatch@1.15.16) (2023-08-03)


### Dependencies

* @applitools/driver bumped to 1.13.4
  #### Bug Fixes

  * extract device orientation from a browser for web executions ([d8d4e91](https://github.com/applitools/eyes.sdk.javascript1/commit/d8d4e919965fb9105915e762c397ec2cc57a8a71))



* @applitools/snippets bumped to 2.4.22
  #### Bug Fixes

  * improve orientation extraction for ios devices ([378d989](https://github.com/applitools/eyes.sdk.javascript1/commit/378d9894e4fbc7247087ccb8c46266dc4737e2e5))
* @applitools/core bumped to 3.6.6
  #### Bug Fixes

  * populate log event settings with env vars ([#1840](https://github.com/applitools/eyes.sdk.javascript1/issues/1840)) ([0a6af60](https://github.com/applitools/eyes.sdk.javascript1/commit/0a6af60b5b988f59b7adb03f6606b3417fbeb537))



* @applitools/core-base bumped to 1.5.0
  #### Features

  * add stuck request retries to all requests to UFG and Eyes ([#1826](https://github.com/applitools/eyes.sdk.javascript1/issues/1826)) ([5884d42](https://github.com/applitools/eyes.sdk.javascript1/commit/5884d428b230e3a832a2110a388ebe63a94006fc))
  * mark session as component ([#1841](https://github.com/applitools/eyes.sdk.javascript1/issues/1841)) ([c579bb6](https://github.com/applitools/eyes.sdk.javascript1/commit/c579bb69de8f3bffc64e73ac8bd4fa646e96eb01))


  #### Bug Fixes

  * populate log event settings with env vars ([#1840](https://github.com/applitools/eyes.sdk.javascript1/issues/1840)) ([0a6af60](https://github.com/applitools/eyes.sdk.javascript1/commit/0a6af60b5b988f59b7adb03f6606b3417fbeb537))
* @applitools/ufg-client bumped to 1.6.0
  #### Features

  * add stuck request retries to all requests to UFG and Eyes ([#1826](https://github.com/applitools/eyes.sdk.javascript1/issues/1826)) ([5884d42](https://github.com/applitools/eyes.sdk.javascript1/commit/5884d428b230e3a832a2110a388ebe63a94006fc))


  #### Bug Fixes

  * improve fetch error experience when fetching from tunnel ([e7d8b49](https://github.com/applitools/eyes.sdk.javascript1/commit/e7d8b49947c07beb27f110cb4952e8c3206469af))
* @applitools/eyes bumped to 1.6.6

* @applitools/ec-client bumped to 1.7.4

* @applitools/spec-driver-webdriver bumped to 1.0.41

* @applitools/nml-client bumped to 1.5.6

* @applitools/spec-driver-webdriverio bumped to 1.5.10

* @applitools/screenshoter bumped to 3.8.7

* @applitools/spec-driver-puppeteer bumped to 1.1.72

* @applitools/spec-driver-selenium bumped to 1.5.55


## [1.15.15](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.14...js/eyes-nightwatch@1.15.15) (2023-07-27)


### Dependencies

* @applitools/core bumped to 3.6.5
  #### Bug Fixes

  * rendering issue with chrome &gt;113 and css white-space property ([cf34ad1](https://github.com/applitools/eyes.sdk.javascript1/commit/cf34ad1a5b3cba0b29b3509616b20a2b1313c62f))



* @applitools/ufg-client bumped to 1.5.3
  #### Bug Fixes

  * consider response headers and status code which are returned from the EC resource handler ([#1823](https://github.com/applitools/eyes.sdk.javascript1/issues/1823)) ([b7bd541](https://github.com/applitools/eyes.sdk.javascript1/commit/b7bd5415ae8f92a8032fc68ba993ccac1d9ff76a))
* @applitools/eyes bumped to 1.6.5


## [1.15.14](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.13...js/eyes-nightwatch@1.15.14) (2023-07-21)


### Bug Fixes

* fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))


### Dependencies

* @applitools/driver bumped to 1.13.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))



* @applitools/logger bumped to 2.0.7
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/eyes bumped to 1.6.4
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))



* @applitools/core bumped to 3.6.4
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))



* @applitools/core-base bumped to 1.4.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))



* @applitools/image bumped to 1.1.2
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/req bumped to 1.5.2
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




## [1.15.13](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.12...js/eyes-nightwatch@1.15.13) (2023-07-21)


### Code Refactoring

* ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))


### Dependencies



## [1.15.12](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.11...js/eyes-nightwatch@1.15.12) (2023-07-18)


### Dependencies

* @applitools/req bumped from 1.4.0 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))
* @applitools/ufg-client bumped from 1.4.1 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))



* @applitools/eyes bumped from 1.6.1 to 1.6.2

* @applitools/core bumped from 3.6.1 to 3.6.2

* @applitools/core-base bumped from 1.4.0 to 1.4.1

* @applitools/ec-client bumped from 1.7.0 to 1.7.1

* @applitools/tunnel-client bumped from 1.1.0 to 1.1.1

* @applitools/nml-client bumped from 1.5.2 to 1.5.3


## [1.15.11](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.10...js/eyes-nightwatch@1.15.11) (2023-07-13)


### Dependencies

* @applitools/driver bumped from 1.13.0 to 1.13.1
  #### Bug Fixes

  * replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))
* @applitools/eyes bumped from 1.6.0 to 1.6.1
  #### Bug Fixes

  * replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))



* @applitools/core bumped from 3.6.0 to 3.6.1
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


## [1.15.10](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.9...js/eyes-nightwatch@1.15.10) (2023-07-10)


### Dependencies

* @applitools/eyes bumped from 1.5.2 to 1.6.0
  #### Features

  * added new chrome emulation devices - `Galaxy S21`, `Galaxy S21 Ultra`, and `Galaxy S22 Ultra` ([0dac7f7](https://github.com/applitools/eyes.sdk.javascript1/commit/0dac7f7941558a4e9416f70a104b96d125d38fc7))


  #### Bug Fixes

  * adjusted behavior of `nmgOptions` property around different screenshot mods ([2709afa](https://github.com/applitools/eyes.sdk.javascript1/commit/2709afa51c98f89d506d901b04454d9f37bacd87))



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


## [1.15.9](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.8...js/eyes-nightwatch@1.15.9) (2023-07-05)


### Dependencies

* @applitools/tunnel-client bumped from 1.0.0 to 1.0.1
  #### Bug Fixes

  * re-release ([438a9aa](https://github.com/applitools/eyes.sdk.javascript1/commit/438a9aa6331ba76d6bdc7d94e8f27d7ae45730da))
* @applitools/eyes bumped from 1.5.1 to 1.5.2

* @applitools/core bumped from 3.5.0 to 3.5.1

* @applitools/ec-client bumped from 1.6.0 to 1.6.1


## [1.15.8](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.7...js/eyes-nightwatch@1.15.8) (2023-07-05)


### Dependencies

* @applitools/driver bumped from 1.12.4 to 1.13.0
  #### Features

  * added auto applitools lib detection ([#1707](https://github.com/applitools/eyes.sdk.javascript1/issues/1707)) ([7d439b5](https://github.com/applitools/eyes.sdk.javascript1/commit/7d439b52af55f3b0596c9d35d6ba85c717448023))
* @applitools/eyes bumped from 1.5.0 to 1.5.1
  #### Bug Fixes

  * fixed issue with getResults log appearing in console when file handler configured ([56b75c2](https://github.com/applitools/eyes.sdk.javascript1/commit/56b75c2185906c1581980985816a000c14000ac3))


  #### Reverts

  * revert removal of `nmgOptions` api ([b8d03c7](https://github.com/applitools/eyes.sdk.javascript1/commit/b8d03c77e8243397ecca233e46d56f7437d16df4))



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


## [1.15.7](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.6...js/eyes-nightwatch@1.15.7) (2023-06-29)


### Dependencies

* @applitools/eyes bumped from 1.4.1 to 1.5.0
  #### Features

  * added a new mode for taking native app screenshots ([#1682](https://github.com/applitools/eyes.sdk.javascript1/issues/1682)) ([0ab7d96](https://github.com/applitools/eyes.sdk.javascript1/commit/0ab7d96164c89ec65b87654fb271d4404bbf70e5))



* @applitools/core bumped from 3.3.1 to 3.4.0
  #### Features

  * added a new mode for taking native app screenshots ([#1682](https://github.com/applitools/eyes.sdk.javascript1/issues/1682)) ([0ab7d96](https://github.com/applitools/eyes.sdk.javascript1/commit/0ab7d96164c89ec65b87654fb271d4404bbf70e5))


  #### Bug Fixes

  * apply default scrolling mode ([f35aba4](https://github.com/applitools/eyes.sdk.javascript1/commit/f35aba454a344c8f0cf787afa2120ce57d91e307))



* @applitools/nml-client bumped from 1.4.0 to 1.5.0
  #### Features

  * added a new mode for taking native app screenshots ([#1682](https://github.com/applitools/eyes.sdk.javascript1/issues/1682)) ([0ab7d96](https://github.com/applitools/eyes.sdk.javascript1/commit/0ab7d96164c89ec65b87654fb271d4404bbf70e5))

## [1.15.6](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.5...js/eyes-nightwatch@1.15.6) (2023-06-28)


### Dependencies

* @applitools/ec-client bumped from 1.4.0 to 1.5.0
  #### Features

  * bump `execution-grid-tunnel` to 2.1.6 ([2840ddf](https://github.com/applitools/eyes.sdk.javascript1/commit/2840ddfc08518495d3a5ba58c33569c213a0eac3))



* @applitools/tunnel-client bumped from 0.1.0 to 0.1.1
  #### Bug Fixes

  * bump `execution-grid-tunnel` to 2.1.6 in tunnel-client ([54f4824](https://github.com/applitools/eyes.sdk.javascript1/commit/54f48249c4d82936366fbd4df5f77a74ffc1b6b4))
* @applitools/eyes bumped from 1.4.0 to 1.4.1

* @applitools/core bumped from 3.3.0 to 3.3.1


## [1.15.5](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.4...js/eyes-nightwatch@1.15.5) (2023-06-28)


### Dependencies

* @applitools/eyes bumped from 1.3.1 to 1.4.0
  #### Features

  * added a new mode for taking native app screenshots ([#1665](https://github.com/applitools/eyes.sdk.javascript1/issues/1665)) ([6237db7](https://github.com/applitools/eyes.sdk.javascript1/commit/6237db7a6212d6c84542f2a5bf9b120e758a7a4b))


  #### Bug Fixes

  * fixed default agentId ([7e49fbe](https://github.com/applitools/eyes.sdk.javascript1/commit/7e49fbe69bebe63e8d8fa3c55b36b00a7c41f604))



* @applitools/core bumped from 3.2.5 to 3.3.0
  #### Features

  * added a new mode for taking native app screenshots ([#1665](https://github.com/applitools/eyes.sdk.javascript1/issues/1665)) ([6237db7](https://github.com/applitools/eyes.sdk.javascript1/commit/6237db7a6212d6c84542f2a5bf9b120e758a7a4b))


  #### Bug Fixes

  * **js/core:** rerelease ([43c4e89](https://github.com/applitools/eyes.sdk.javascript1/commit/43c4e8987a53ecf6db883122c0f3acb7adcd3e14))



* @applitools/nml-client bumped from 1.3.59 to 1.4.0
  #### Features

  * added a new mode for taking native app screenshots ([#1665](https://github.com/applitools/eyes.sdk.javascript1/issues/1665)) ([6237db7](https://github.com/applitools/eyes.sdk.javascript1/commit/6237db7a6212d6c84542f2a5bf9b120e758a7a4b))

## [1.15.4](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.3...js/eyes-nightwatch@1.15.4) (2023-06-28)


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



* @applitools/driver bumped from 1.12.3 to 1.12.4

* @applitools/logger bumped from 2.0.4 to 2.0.5

* @applitools/eyes bumped from 1.3.0 to 1.3.1

* @applitools/core bumped from 3.2.4 to 3.2.5

* @applitools/core-base bumped from 1.2.0 to 1.2.1

* @applitools/image bumped from 1.0.35 to 1.0.36

* @applitools/req bumped from 1.3.2 to 1.3.3

* @applitools/socket bumped from 1.1.4 to 1.1.5

* @applitools/spec-driver-webdriver bumped from 1.0.35 to 1.0.36

* @applitools/nml-client bumped from 1.3.58 to 1.3.59

* @applitools/screenshoter bumped from 3.8.0 to 3.8.1

* @applitools/ufg-client bumped from 1.2.21 to 1.2.22


## [1.15.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.2...js/eyes-nightwatch@1.15.3) (2023-06-21)


### Bug Fixes

* fix coverage tests ([f5067d8](https://github.com/applitools/eyes.sdk.javascript1/commit/f5067d8693502c3f6c9dbdf8adafbe513d86a9ad))
* fix coverage tests ([f5282cc](https://github.com/applitools/eyes.sdk.javascript1/commit/f5282cc59e11d42b2f51d581f4dd3038b4f3974b))


### Dependencies

* @applitools/driver bumped from 1.12.1 to 1.12.3

* @applitools/eyes bumped from 1.2.17 to 1.3.0
  #### Features

  * added overload for locate method, to call it with custom target ([5d5914a](https://github.com/applitools/eyes.sdk.javascript1/commit/5d5914a5dae6822cde0086d6b9f4d6f9ac7cc4f2))



* @applitools/spec-driver-webdriver bumped from 1.0.33 to 1.0.35


## [1.15.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch@1.15.1...js/eyes-nightwatch@1.15.2) (2023-06-15)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/eyes bumped from 1.2.16 to 1.2.17

## [1.15.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/eyes-nightwatch-v1.15.0...js/eyes-nightwatch@1.15.1) (2023-06-14)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/eyes bumped from 1.2.14 to 1.2.16

## 1.15.0 - 2023/4/19

### Features
- Added `Resize` value to `StitchMode` enum
- Improved extraction of nml element
- Added `removeDuplicateTests` property to the `RunnerOptions` to remove duplicated tests in the runner at the end of execution
- Make `locate` to return coordinates that could be directly used with the driver
### Bug fixes
- Avoid handing process when using execution cloud
- Fixed slowness during ufg tests
- Optimized number of requests during polling
- Fixed screenshot framing
- Fixed issue with css fetching for dom capture

## 1.14.0 - 2023/3/2

### Features
- Added new android devices Sony Xperia 1 II, Sony Xperia Ace II, Huawei P30 Lite, Xiaomi Redmi Note 10 JE
- Add NML support for Android
- Crop screenshot image base on account info
### Bug fixes
- Fixed issue with sessionId on ufg

## 1.13.0 - 2023/1/23

### Features
- No new features
### Bug fixes

## 1.12.1 - 2022/12/29

### Features
### Bug fixes
- Improved webdriver url extraction

## 1.12.0 - 2022/12/27

### Features
- Added new selector extensions `child` and `fallback`
- Changed default value of `sendDom` from `true` to dynamically calculated
- Added new android device `Sony Xperia 10 II`
- Mark target element with `data-applitools-scroll` attribute before capture dom
- Added new iOS device - 'iPad Pro (11-inch) (4th generation)'
- Use user agent metadata to improve browser environment detection logic
- Use APPLITOOLS_CONCURRENCY env variable to specify concurrency
- Added `ignoreColors` method to `CheckSettings` to set a match level
- Additional internal event logs
### Bug fixes
- Fixed issue with logs not being saved/written
- Fixed issue with ufg renders failing intermittently
- Fixed error that was happening when test results were deleted
- Fixed bug that caused `extractText` to throw, due to fractional size of the target region
- Fix dontCloseBatches mapping
- Fixed issue when current context is not being preserved in ufg mode
- Fixed issue with element scroll position not being restored after screenshot is taken on native platforms
- Handle fake shadowRoot with UFG
- Handed error during polling in long requests to eyes server

## 1.11.5 - 2022/10/7

### Features
### Bug fixes
- Fixed the issue with screenshots being taken on chrome-emulated devices
- Fixed bug when error was thrown when coded region wasn't found using selector
- Blank missed frames src in ufg
- Fix an issue when ufg related requests were not sent through the proxy

## 1.11.4 - 2022/9/29

### Features
- Don't fail `eyes.open` when there is a failure to set viewport size in `UFG`.
- Support Nightwatch major version 2
- Added support for lazy loading views in android native apps
- Using `lazyLoad.waitingTime` as a delay between stitches by default
- Added `Sony Xperia 10 II` emulation device
- Added `iPhone 14`  and `iPhone 14 Pro Max` ios devices
- Support Nightwatch major version 2
- Deprecated "Content" match level value in favor of "IgnoreColors"
### Bug fixes
- Fixed incorrect calculation of the target element position.

## 1.11.3 - 2022/7/28

### Features
- Added new android devices
### Bug fixes
- Fixed bug where a failure in a single UFG environment fails all other environments in the same configuration
- Fixed various issues during taking screenshots in landscape orientation on some native devices
- Avoided unexpected touch actions during `check` on Android apps
- Better support in DOM slot element
- Fixed some issues with helper library usage

## 1.11.2 - 2022/7/5

### Features
- Added support for taking full screenshots of elements that are scroll by pages only
- Allowed `` values in custom properties
- Add special attribute for pseudo elements
- Add the ability for the SDK to lazy load the page prior to performing a check window
- Support padding for regions in the following region types - ignoreRegions, layoutRegions, strictRegions, contentRegions
- Support `addMobileDevice` in user API for NMG
- Add support for dynamic coded regions
### Bug fixes
- Fixed the "Maximum Call Stack Size Exceeded" error when taking screenshots on iOS Safari
- Fixed an issue with wrong cropped screenshots of elements out of viewport bounds on native devices
- Fixed broken links to enums implementation in the README.md
- Fixed `forceFullPageScreenshot` option behavior
- Fix calling `waitBeforeCapture` when failed to set required viewport size
- Fix rendering issues with Salesforce Lightning design system
- Fix issue that prevented self-signed certificates from working when connecting through a proxy server
- Fixed native screenshots of the elements under large collapsing areas
- Fixed scrolling on some android devices
- Improved handling of touch padding related issues in native apps
- Prevented navbar from appearing on Android 12 screenshots

## 1.11.1 - 2022/6/2

### Features
### Bug fixes
- Fix rounding error of image size when scaling introduces fractions

## 1.11.0 - 2022/6/1

### Features
- Support UFG for native mobile
- `runner.getAllTestResults` returns the corresponding UFG browser/device configuration for each test. This is available as `runner.getAllTestResults()[i].browserInfo`.
- Support iPhone SE `IosDeviceName.iPhone_SE` and iPhone 8 Plus `IosDeviceName.iPhone_8_Plus` iOS devices
- Support Galaxy S22 `DeviceName.Galaxy_S22` emulation device
- Added support for drivers that return screenshots in jpeg format
- Dorp support for Node.js versions <=12
### Bug fixes
- `runner.getAllTestResults` now aborts unclosed tests
- `runner.getAllTestResults` now returns all results, including aborted tests
- `extractText` now supports regions that don't use hints while using `x`/`y` coordinates
- accept ios and android lowercase as driver platformName capability when using custom grid
- Fixed check region fully in classic execution when using CSS stitching
- Support data urls in iframes
- Allow running with self-signed certificates
- Fixed bug in native apps when screenshot of the element was taken only for the small visible part of the element
- Fixed bug when navigation bar was presented in screenshot on Android 12
- Fixed `CheckSetting`'s `fully` being overridden by `Configuration`'s `forceFullPageScreenshot`
- Set EyesExceptions (such as new test, diffs exception and failed test exception) to exception property in TestResultsSummary
- Improve error message when failed to set viewport size
- Fixed incorrect calculation of coded regions in classic mode when using CSS stitching

## 1.10.3 - 2022/3/14

- fixing: Nightwatch 1.10.2 throwing Module assert/Strict not found
- updated to @applitools/eyes-api@1.2.0 (from 1.1.6)
- updated to @applitools/eyes-sdk-core@13.1.1 (from 12.24.7)
- updated to @applitools/types@1.2.2 (from 1.0.22)
- updated to @applitools/utils@1.2.13 (from 1.2.4)
- updated to @applitools/visual-grid-client@15.10.1 (from 15.8.53)
- updated to @applitools/visual-grid-client@15.10.1 (from 15.8.53)
## 1.10.2 - 2021/12/21

- updated to @applitools/eyes-sdk-core@12.24.7 (from 12.24.5)
- updated to @applitools/types@1.0.22 (from 1.0.21)
- updated to @applitools/visual-grid-client@15.8.53 (from 15.8.49)

## 1.10.1 - 2021/12/7

- implement `getCapabilities` instead of `getDriverInfo`
- updated to @applitools/eyes-sdk-core@12.24.5 (from 12.24.0)
- updated to @applitools/types@1.0.21 (from 1.0.19)
- updated to @applitools/visual-grid-client@15.8.49 (from 15.8.44)

## 1.10.0 - 2021/11/10

- support cookies
- updated to @applitools/eyes-api@1.0.11 (from 1.0.6)
- updated to @applitools/eyes-sdk-core@12.22.4 (from 12.21.2)
- updated to @applitools/utils@1.2.2 (from 1.2.0)
- updated to @applitools/visual-grid-client@15.8.18 (from 15.8.11)
- updated to @applitools/eyes-api@1.1.6 (from 1.1.5)
- updated to @applitools/eyes-sdk-core@12.24.0 (from 12.23.24)
- updated to @applitools/types@1.0.19 (from 1.0.18)
- updated to @applitools/visual-grid-client@15.8.44 (from 15.8.43)

## 1.9.0 - 2021/11/5

- updated to @applitools/eyes-api@1.1.5 (from 1.0.6)
- updated to @applitools/eyes-sdk-core@12.23.24 (from 12.21.2)
- updated to @applitools/utils@1.2.4 (from 1.2.0)
- updated to @applitools/visual-grid-client@15.8.43 (from 15.8.11)

## 1.8.3 - 2021/6/27

- fix nightwatch-api support
- updated to @applitools/eyes-api@1.0.6 (from 1.0.5)
- updated to @applitools/eyes-sdk-core@12.21.2 (from 12.21.1)

## 1.8.2 - 2021/5/25

- added full typescript support
- introduced @applitools/eyes-api package with new api
- updated to @applitools/eyes-api@1.0.3 (from 1.0.1)
- updated to @applitools/eyes-sdk-core@12.20.0 (from 12.19.2)
- updated to @applitools/utils@1.2.0 (from 1.1.3)
- updated to @applitools/visual-grid-client@15.8.7 (from 15.8.5)

## 1.8.1 - 2021/5/12

- updated to @applitools/eyes-api@1.0.1 (from 1.0.0)
- updated to @applitools/eyes-sdk-core@12.19.2 (from 12.19.1)
- updated to @applitools/visual-grid-client@15.8.5 (from 15.8.4)

## 1.8.0 - 2021/5/11

- added full typescript support
- introduced @applitools/eyes-api package with new api
- updated to @applitools/eyes-api@1.0.0 (from 0.0.2)
- updated to @applitools/eyes-sdk-core@12.19.1 (from 12.14.2)
- updated to @applitools/utils@1.1.3 (from 1.1.0)
- updated to @applitools/visual-grid-client@15.8.4 (from 15.5.14)

## 1.7.0 - 2021/4/27

- updated to @applitools/eyes-sdk-core@12.17.4 (from 12.17.2)
- updated to @applitools/visual-grid-client@15.8.2 (from 15.8.1)

## 1.6.0 - 2021/4/22

- fix spec.build for testing
- updated to @applitools/eyes-sdk-core@12.17.2 (from 12.14.2)
- updated to @applitools/visual-grid-client@15.8.1 (from 15.5.14)

## 1.5.2 - 2021/1/29

- chore: add husky
- updated to @applitools/eyes-sdk-core@12.14.2 (from 12.12.2)
- updated to @applitools/visual-grid-client@15.5.14 (from 15.5.5)

## 1.5.1 - 2021/1/12

- updated to @applitools/eyes-sdk-core@12.12.2 (from 12.10.0)
- updated to @applitools/visual-grid-client@15.5.5 (from 15.4.0)

## 1.5.0 - 2020/12/18

- updated to @applitools/eyes-sdk-core@12.10.0 (from 12.9.3)
- updated to @applitools/visual-grid-client@15.4.0 (from 15.3.2)

## 1.4.3 - 2020/12/15

- updated to @applitools/eyes-sdk-core@12.9.3 (from 12.9.2)
- updated to @applitools/visual-grid-client@15.3.2 (from 15.3.1)

## 1.4.2 - 2020/12/14

- updated to @applitools/eyes-sdk-core@12.9.2 (from 12.9.1)
- updated to @applitools/visual-grid-client@15.3.1 (from 15.3.0)

## 1.4.1 - 2020/12/11

- update chaining API to support new concurrency configuration

## 1.4.0 - 2020/12/11

- updated to @applitools/eyes-sdk-core@12.9.1 (from 12.8.4)
- updated to @applitools/visual-grid-client@15.3.0 (from 15.2.6)

## 1.3.0 - 2020/12/8

- updated to @applitools/eyes-sdk-core@12.8.4 (from 12.6.1)
- updated to @applitools/visual-grid-client@15.2.6 (from 15.2.1)

## 1.2.2 - 2020/12/1

- export `RunnerOptions`

## 1.2.1 - 2020/11/29

- updated to @applitools/visual-grid-client@15.2.1 (from 15.2.0)

## 1.2.0 - 2020/11/24

- updated to @applitools/eyes-sdk-core@12.6.1 (from 12.5.7)
- updated to @applitools/visual-grid-client@15.2.0 (from 15.1.1)

## 1.1.0 - 2020/11/12

- fix firefox region compensation issue
- add 2020 ios devices
- fix coded region calculation when running in target region ([Trello 538](https://trello.com/c/FQ8iJZdi))
- deprecate `saveDebugData`
- updated to @applitools/eyes-sdk-core@12.5.7 (from 12.5.5)
- updated to @applitools/visual-grid-client@15.1.1 (from 15.1.0)`

## 1.0.3 - 2020/11/5

- fix `getWindowRect` and `setWindowRect` so they work on drivers running with the JSON Wire Protocol (e.g., non-W3C)

## 1.0.2 - 2020/11/2

- fix `eyesOpen` API

## 1.0.1 - 2020/11/2

- no changes

## 1.0.0 - 2020/11/2

- initial release
