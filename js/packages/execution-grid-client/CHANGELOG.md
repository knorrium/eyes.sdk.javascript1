# Changelog

## [1.7.4](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.7.3...js/ec-client@1.7.4) (2023-08-03)


### Dependencies

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
* @applitools/spec-driver-webdriver bumped to 1.0.41


## [1.7.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.7.2...js/ec-client@1.7.3) (2023-07-21)


### Bug Fixes

* fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))


### Dependencies

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



* @applitools/socket bumped to 1.1.7
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))



* @applitools/spec-driver-webdriver bumped to 1.0.40
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))



* @applitools/tunnel-client bumped to 1.1.3
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))




## [1.7.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.7.1...js/ec-client@1.7.2) (2023-07-21)


### Code Refactoring

* ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))


### Dependencies



## [1.7.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.7.0...js/ec-client@1.7.1) (2023-07-18)


### Dependencies

* @applitools/req bumped from 1.4.0 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))
* @applitools/core-base bumped from 1.4.0 to 1.4.1

* @applitools/tunnel-client bumped from 1.1.0 to 1.1.1


## [1.7.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.6.2...js/ec-client@1.7.0) (2023-07-13)


### Features

* added internal function to prepare environment before running tunnels ([3d19ec3](https://github.com/applitools/eyes.sdk.javascript1/commit/3d19ec3b274702ffdf26b766b7351ec1f4b66a6d))


### Dependencies

* @applitools/driver bumped from 1.13.0 to 1.13.1
  #### Bug Fixes

  * replaced NML prefixed appium env vars with APPLITOOLS prefixed ([8905b90](https://github.com/applitools/eyes.sdk.javascript1/commit/8905b90e7c4ec6e310f6e52c03bbcc7acf1ff2ab))
* @applitools/tunnel-client bumped from 1.0.2 to 1.1.0
  #### Features

  * added internal function to prepare environment before running tunnels ([3d19ec3](https://github.com/applitools/eyes.sdk.javascript1/commit/3d19ec3b274702ffdf26b766b7351ec1f4b66a6d))


  #### Bug Fixes

  * prevent tunnel binaries from overriding itself ([5609a36](https://github.com/applitools/eyes.sdk.javascript1/commit/5609a36c93622c9b8eeb4b4ab25f95907df8baa4))



* @applitools/spec-driver-webdriver bumped from 1.0.37 to 1.0.38

* @applitools/execution-grid-tunnel bumped to 2.1.8


## [1.6.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.6.1...js/ec-client@1.6.2) (2023-07-10)


### Bug Fixes

* fixed issue that caused creation of unnecessary tunnels ([b38fe37](https://github.com/applitools/eyes.sdk.javascript1/commit/b38fe3754f97c5f312ceffd74406255654466ab7))
* start tunnels with proper regional server ([2a34ed8](https://github.com/applitools/eyes.sdk.javascript1/commit/2a34ed8cd72dc9ac54957348cbe8ba9e67032340))


### Dependencies

* @applitools/core-base bumped from 1.3.0 to 1.4.0
  #### Features

  * support custom property per renderer ([#1715](https://github.com/applitools/eyes.sdk.javascript1/issues/1715)) ([8cf6b1f](https://github.com/applitools/eyes.sdk.javascript1/commit/8cf6b1fb0563b2485ca18eebc2efd236c2287db8))



* @applitools/image bumped from 1.0.36 to 1.1.0
  #### Features

  * prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))
* @applitools/tunnel-client bumped from 1.0.1 to 1.0.2
  #### Bug Fixes

  * start tunnels with proper regional server ([2a34ed8](https://github.com/applitools/eyes.sdk.javascript1/commit/2a34ed8cd72dc9ac54957348cbe8ba9e67032340))

## [1.6.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.6.0...js/ec-client@1.6.1) (2023-07-05)


### Dependencies

* @applitools/tunnel-client bumped from 1.0.0 to 1.0.1
  #### Bug Fixes

  * re-release ([438a9aa](https://github.com/applitools/eyes.sdk.javascript1/commit/438a9aa6331ba76d6bdc7d94e8f27d7ae45730da))

## [1.6.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.5.0...js/ec-client@1.6.0) (2023-07-05)


### Features

* added support of regional execution cloud servers ([#1711](https://github.com/applitools/eyes.sdk.javascript1/issues/1711)) ([2e26c69](https://github.com/applitools/eyes.sdk.javascript1/commit/2e26c6944bb15f6121fb37c1dba95aba162c1f6a))
* support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))


### Bug Fixes

* fixed auto tunnel cleanup after unexpected end of the process ([3c1ad08](https://github.com/applitools/eyes.sdk.javascript1/commit/3c1ad0837d2d3560becc6d89370aa878becb3270))


### Dependencies

* @applitools/core-base bumped from 1.2.1 to 1.3.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))



* @applitools/req bumped from 1.3.3 to 1.4.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))
* @applitools/driver bumped from 1.12.4 to 1.13.0
  #### Features

  * added auto applitools lib detection ([#1707](https://github.com/applitools/eyes.sdk.javascript1/issues/1707)) ([7d439b5](https://github.com/applitools/eyes.sdk.javascript1/commit/7d439b52af55f3b0596c9d35d6ba85c717448023))
* @applitools/tunnel-client bumped from 0.1.1 to 1.0.0
  #### Features

  * added binaries and made them available in jfrog ([92033fe](https://github.com/applitools/eyes.sdk.javascript1/commit/92033fed7edc58bbc4a4e37269068418fe3afc3d))
  * release as 1.0.0 ([93bf312](https://github.com/applitools/eyes.sdk.javascript1/commit/93bf31205b07d19bc2cb4f50b974c7bad0f49cea))



* @applitools/spec-driver-webdriver bumped from 1.0.36 to 1.0.37


## [1.5.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.4.0...js/ec-client@1.5.0) (2023-06-28)


### Features

* bump `execution-grid-tunnel` to 2.1.6 ([2840ddf](https://github.com/applitools/eyes.sdk.javascript1/commit/2840ddfc08518495d3a5ba58c33569c213a0eac3))


### Dependencies

* @applitools/tunnel-client bumped from 0.1.0 to 0.1.1
  #### Bug Fixes

  * bump `execution-grid-tunnel` to 2.1.6 in tunnel-client ([54f4824](https://github.com/applitools/eyes.sdk.javascript1/commit/54f48249c4d82936366fbd4df5f77a74ffc1b6b4))

## [1.4.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.3.0...js/ec-client@1.4.0) (2023-06-28)


### Features

* handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))


### Bug Fixes

* remove content type when request doesn't contain any body ([354e877](https://github.com/applitools/eyes.sdk.javascript1/commit/354e8779af9e0be2d9ec1f321acd312862448f91))


### Dependencies

* @applitools/utils bumped from 1.4.0 to 1.5.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))
* @applitools/tunnel-client bumped from 0.0.5 to 0.1.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))



* @applitools/core-base bumped from 1.2.0 to 1.2.1

* @applitools/image bumped from 1.0.35 to 1.0.36

* @applitools/logger bumped from 2.0.4 to 2.0.5

* @applitools/req bumped from 1.3.2 to 1.3.3

* @applitools/driver bumped from 1.12.3 to 1.12.4

* @applitools/socket bumped from 1.1.4 to 1.1.5

* @applitools/spec-driver-webdriver bumped from 1.0.35 to 1.0.36


## [1.3.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.2.34...js/ec-client@1.3.0) (2023-06-21)


### Features

* put in a queue create tunnel requests which cannot succeed due to a limit ([3309147](https://github.com/applitools/eyes.sdk.javascript1/commit/33091473f3fcbc4dd5fc853624bbe441ce11ce87))


### Dependencies

* @applitools/core-base bumped from 1.1.58 to 1.2.0
  #### Features

  * **js/core-base:** new feature ([dd5705d](https://github.com/applitools/eyes.sdk.javascript1/commit/dd5705d5e99d34f9492e890a0b4af6c52d6b33e3))


  #### Bug Fixes

  * rerelease ([2d46d0c](https://github.com/applitools/eyes.sdk.javascript1/commit/2d46d0c9ee14a72406e60350d4cce92991272afd))



* @applitools/driver bumped from 1.12.2 to 1.12.3

* @applitools/logger bumped from 2.0.3 to 2.0.4
  #### Bug Fixes

  * fixed issue when extended logger didn't preserve base's handler ([7c5e029](https://github.com/applitools/eyes.sdk.javascript1/commit/7c5e0299522f792aad72b7b3827df31a1ab2d68f))
* @applitools/socket bumped from 1.1.3 to 1.1.4

* @applitools/spec-driver-webdriver bumped from 1.0.34 to 1.0.35


## [1.2.34](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client@1.2.33...js/ec-client@1.2.34) (2023-06-15)


### Bug Fixes

* solve mismatch between content type and body in some commands ([#1660](https://github.com/applitools/eyes.sdk.javascript1/issues/1660)) ([8d1d486](https://github.com/applitools/eyes.sdk.javascript1/commit/8d1d4863d09af8266e93c59f99fa9f5a497652a9))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @applitools/core-base bumped from 1.1.57 to 1.1.58
    * @applitools/req bumped from 1.3.1 to 1.3.2
    * @applitools/socket bumped from 1.1.2 to 1.1.3

## [1.2.33](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ec-client-v1.2.32...js/ec-client@1.2.33) (2023-06-13)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/core-base bumped from 1.1.56 to 1.1.57
    * @applitools/driver bumped from 1.12.1 to 1.12.2
    * @applitools/logger bumped from 2.0.2 to 2.0.3
    * @applitools/req bumped from 1.3.0 to 1.3.1
    * @applitools/socket bumped from 1.1.1 to 1.1.2
    * @applitools/spec-driver-webdriver bumped from 1.0.33 to 1.0.34
    * @applitools/utils bumped from 1.3.37 to 1.4.0
