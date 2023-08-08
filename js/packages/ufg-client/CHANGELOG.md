# Changelog

## [1.7.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.6.0...js/ufg-client@1.7.0) (2023-08-08)


### Features

* allow providing custom headers for resource fetching  ([#1852](https://github.com/applitools/eyes.sdk.javascript1/issues/1852)) ([372cb96](https://github.com/applitools/eyes.sdk.javascript1/commit/372cb96b905a0661c36e2fa10a7855208fb55bb0))

## [1.6.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.5.3...js/ufg-client@1.6.0) (2023-08-03)


### Features

* add stuck request retries to all requests to UFG and Eyes ([#1826](https://github.com/applitools/eyes.sdk.javascript1/issues/1826)) ([5884d42](https://github.com/applitools/eyes.sdk.javascript1/commit/5884d428b230e3a832a2110a388ebe63a94006fc))


### Bug Fixes

* improve fetch error experience when fetching from tunnel ([e7d8b49](https://github.com/applitools/eyes.sdk.javascript1/commit/e7d8b49947c07beb27f110cb4952e8c3206469af))

## [1.5.3](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.5.2...js/ufg-client@1.5.3) (2023-07-27)


### Bug Fixes

* consider response headers and status code which are returned from the EC resource handler ([#1823](https://github.com/applitools/eyes.sdk.javascript1/issues/1823)) ([b7bd541](https://github.com/applitools/eyes.sdk.javascript1/commit/b7bd5415ae8f92a8032fc68ba993ccac1d9ff76a))

## [1.5.2](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.5.1...js/ufg-client@1.5.2) (2023-07-21)


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

## [1.5.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.5.0...js/ufg-client@1.5.1) (2023-07-21)


### Code Refactoring

* ufg client ([#1780](https://github.com/applitools/eyes.sdk.javascript1/issues/1780)) ([d60cf16](https://github.com/applitools/eyes.sdk.javascript1/commit/d60cf1616741a96b152a1548760bb98116e5c3f9))


### Dependencies



## [1.5.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.4.1...js/ufg-client@1.5.0) (2023-07-18)


### Features

* support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))


### Dependencies

* @applitools/req bumped from 1.4.0 to 1.5.0
  #### Features

  * support retries on stuck requests ([be673bb](https://github.com/applitools/eyes.sdk.javascript1/commit/be673bb505c9b21d6aea37d86e88513e95e3cb02))

## [1.4.1](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.4.0...js/ufg-client@1.4.1) (2023-07-13)


### Bug Fixes

* fixed an issue when an inability to freeze a gif image caused sdk crush ([dca9ead](https://github.com/applitools/eyes.sdk.javascript1/commit/dca9eadd2bab39d1fc20b99d997879075691f0ee))
* fixed issue when sdk crushed due to invalid resource url in ufg mode ([8b44958](https://github.com/applitools/eyes.sdk.javascript1/commit/8b449580a930753dd2735befdcdb4c46e184b2a9))

## [1.4.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.3.0...js/ufg-client@1.4.0) (2023-07-10)


### Features

* ability to skip deserialize dom snapshot ([#1703](https://github.com/applitools/eyes.sdk.javascript1/issues/1703)) ([a461af4](https://github.com/applitools/eyes.sdk.javascript1/commit/a461af4fb72b7cba1ae15a5d20376fd02e7d9003))
* add support for resource fetching through eg tunnel ([3daa4da](https://github.com/applitools/eyes.sdk.javascript1/commit/3daa4da975cbe23ffb33bb3e9f5f76732ead1075))
* added new chrome emulation devices - `Galaxy S21`, `Galaxy S21 Ultra`, and `Galaxy S22 Ultra` ([0dac7f7](https://github.com/applitools/eyes.sdk.javascript1/commit/0dac7f7941558a4e9416f70a104b96d125d38fc7))
* prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))


### Bug Fixes

* add support for resource fetching through eg tunnel ([a0b98e3](https://github.com/applitools/eyes.sdk.javascript1/commit/a0b98e364cf95bf6bed84c1afe3376384d781717))
* add support for resource fetching through eg tunnel ([3daa4da](https://github.com/applitools/eyes.sdk.javascript1/commit/3daa4da975cbe23ffb33bb3e9f5f76732ead1075))


### Dependencies

* @applitools/image bumped from 1.0.36 to 1.1.0
  #### Features

  * prevent animated gif images from playing in ufg ([#1721](https://github.com/applitools/eyes.sdk.javascript1/issues/1721)) ([30f39cc](https://github.com/applitools/eyes.sdk.javascript1/commit/30f39cc8ef2cdfa1d85bd7a0037b818db1b52e1b))

## [1.3.0](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.2.22...js/ufg-client@1.3.0) (2023-07-05)


### Features

* support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))


### Dependencies

* @applitools/req bumped from 1.3.3 to 1.4.0
  #### Features

  * support dns caching ([#1680](https://github.com/applitools/eyes.sdk.javascript1/issues/1680)) ([9bbff34](https://github.com/applitools/eyes.sdk.javascript1/commit/9bbff34f50c9d18758b55a6bcb45571ca1148180))

## [1.2.22](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.2.21...js/ufg-client@1.2.22) (2023-06-28)


### Dependencies

* @applitools/utils bumped from 1.4.0 to 1.5.0
  #### Features

  * handled abandoned tunnels ([#1669](https://github.com/applitools/eyes.sdk.javascript1/issues/1669)) ([e01a9f6](https://github.com/applitools/eyes.sdk.javascript1/commit/e01a9f6f7543fc5e6bd842acf6ee8de8cfb49998))
* @applitools/logger bumped from 2.0.4 to 2.0.5

* @applitools/req bumped from 1.3.2 to 1.3.3


## [1.2.21](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.2.20...js/ufg-client@1.2.21) (2023-06-21)


### Dependencies

* @applitools/logger bumped from 2.0.3 to 2.0.4
  #### Bug Fixes

  * fixed issue when extended logger didn't preserve base's handler ([7c5e029](https://github.com/applitools/eyes.sdk.javascript1/commit/7c5e0299522f792aad72b7b3827df31a1ab2d68f))

## [1.2.20](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client@1.2.19...js/ufg-client@1.2.20) (2023-06-15)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/req bumped from 1.3.1 to 1.3.2

## [1.2.19](https://github.com/applitools/eyes.sdk.javascript1/compare/js/ufg-client-v1.2.18...js/ufg-client@1.2.19) (2023-06-13)


### Dependencies

* update some dependencies
* The following workspace dependencies were updated
  * dependencies
    * @applitools/logger bumped from 2.0.2 to 2.0.3
    * @applitools/req bumped from 1.3.0 to 1.3.1
    * @applitools/utils bumped from 1.3.37 to 1.4.0
