# Changelog

## [1.5.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.4.3...js/core-base@1.5.0) (2023-08-03)


### Features

* add stuck request retries to all requests to UFG and Eyes ([#1826](https://github.com/applitools/eyes.sdk.javascript1/issues/1826)) ([5884d42](https://github.com/applitools/eyes.sdk.javascript1/commit/5884d428b230e3a832a2110a388ebe63a94006fc))
* mark session as component ([#1841](https://github.com/applitools/eyes.sdk.javascript1/issues/1841)) ([c579bb6](https://github.com/applitools/eyes.sdk.javascript1/commit/c579bb69de8f3bffc64e73ac8bd4fa646e96eb01))


### Bug Fixes

* populate log event settings with env vars ([#1840](https://github.com/applitools/eyes.sdk.javascript1/issues/1840)) ([0a6af60](https://github.com/applitools/eyes.sdk.javascript1/commit/0a6af60b5b988f59b7adb03f6606b3417fbeb537))

## [1.4.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.4.2...js/core-base@1.4.3) (2023-07-21)


### Bug Fixes

* fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))


### Dependencies

* @applitools/image bumped to 1.1.2
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/logger bumped to 2.0.7
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))
* @applitools/req bumped to 1.5.2
  #### Bug Fixes

  * fix workspace dependencies ([2a3856f](https://github.com/applitools/eyes.sdk.javascript1/commit/2a3856f3ce3bcf1407f59c676653b6f218556760))

## [1.4.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.4.1...js/core-base@1.4.2) (2023-07-21)


### Code Refactoring

* ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))


### Dependencies



## [1.4.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.4.0...js/core-base@1.4.1) (2023-07-18)


### Dependencies

* @applitools/req bumped from 1.4.0 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))

## [1.4.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.3.0...js/core-base@1.4.0) (2023-07-10)


### Features

* support custom property per renderer ([#1715](https://github.com/applitools/eyes.sdk.javascript1/issues/1715)) ([8cf6b1f](https://github.com/applitools/eyes.sdk.javascript1/commit/8cf6b1fb0563b2485ca18eebc2efd236c2287db8))


### Dependencies

* @applitools/image bumped from 1.0.36 to 1.1.0
  #### Features

  * prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))

## [1.3.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.2.1...js/core-base@1.3.0) (2023-07-05)


### Features

* support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))


### Dependencies

* @applitools/req bumped from 1.3.3 to 1.4.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))

## [1.2.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.2.0...js/core-base@1.2.1) (2023-06-28)


### Dependencies

* @applitools/utils bumped from 1.4.0 to 1.5.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))
* @applitools/image bumped from 1.0.35 to 1.0.36

* @applitools/logger bumped from 2.0.4 to 2.0.5

* @applitools/req bumped from 1.3.2 to 1.3.3


## [1.2.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.1.58...js/core-base@1.2.0) (2023-06-21)


### Features

* **js/core-base:** new feature ([dd5705d](https://github.com/applitools/eyes.sdk.javascript1/commit/dd5705d5e99d34f9492e890a0b4af6c52d6b33e3))


### Bug Fixes

* rerelease ([2d46d0c](https://github.com/applitools/eyes.sdk.javascript1/commit/2d46d0c9ee14a72406e60350d4cce92991272afd))


### Dependencies

* @applitools/logger bumped from 2.0.3 to 2.0.4
  #### Bug Fixes

  * fixed issue when extended logger didn't preserve base's handler ([7c5e029](https://github.com/applitools/eyes.sdk.javascript1/commit/7c5e0299522f792aad72b7b3827df31a1ab2d68f))

## [1.1.58](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.1.57...js/core-base@1.1.58) (2023-06-15)


### Bug Fixes

* rerelease ([2d46d0c](https://github.com/applitools/eyes.sdk.javascript1/commit/2d46d0c9ee14a72406e60350d4cce92991272afd))

## [1.1.58](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base@1.1.57...js/core-base@1.1.58) (2023-06-15)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/req bumped from 1.3.1 to 1.3.2

## [1.1.57](https://github.com/applitools/eyes.sdk.javascript1/compare/js/core-base-v1.1.56...js/core-base@1.1.57) (2023-06-13)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/image bumped from 1.0.34 to 1.0.35
    * @applitools/logger bumped from 2.0.2 to 2.0.3
    * @applitools/req bumped from 1.3.0 to 1.3.1
    * @applitools/utils bumped from 1.3.37 to 1.4.0

## [1.1.56](https://github.com/applitools/eyes.sdk.javascript1/compare/core-base-v1.1.55...core-base@1.1.56) (2023-06-09)


### Bug Fixes

* **core-base:** some fix ([c4e9c1c](https://github.com/applitools/eyes.sdk.javascript1/commit/c4e9c1cc008aac9d999935ec167280fb1af368d6))
* **core-base:** some fix ([aadec2e](https://github.com/applitools/eyes.sdk.javascript1/commit/aadec2e0ca0c3467367fe6e5e3c83c3f4e316dd3))
* **core-base:** some fix ([0899c64](https://github.com/applitools/eyes.sdk.javascript1/commit/0899c644f69a652d615bcac7fd42d7d5793cbc88))
* **core-base:** some fix ([c7e9c31](https://github.com/applitools/eyes.sdk.javascript1/commit/c7e9c3123e423016956a05f6a97a1be51a73f319))
* **core-base:** some fix ([fd6cfa7](https://github.com/applitools/eyes.sdk.javascript1/commit/fd6cfa7f20cc819ce3685f9000fb6c9858de311b))
* **core-base:** some fix ([4e7a92e](https://github.com/applitools/eyes.sdk.javascript1/commit/4e7a92e572d9f6da592c66aae86e77e33be6f345))
* **core-base:** some fix ([e238b81](https://github.com/applitools/eyes.sdk.javascript1/commit/e238b813733606e9cfddba8a82ec03a1a2c97637))
