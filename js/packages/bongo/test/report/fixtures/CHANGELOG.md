# Change Log

## Unreleased

## 4.58.4 - 2022/4/14

### features
- support ufg for native mobile
- `runner.getalltestresults` returns the corresponding ufg browser/device configuration for each test. this is available as `runner.getalltestresults()[i].browserinfo`.
### bug fixes
- `extracttext` now supports regions that don't use hints while using `x`/`y` coordinates
- accept ios and android lowercase as driver platformname capability when using custom grid
- when running on a native ios app, allow capturing navigationbar and tabbar regions
- when running a native app on android, in case we test a device in landscape mode, make sure to account for the navigation bar on the left or right and not at the bottom of the image. also account for an appium bug when calculating system bars height.
- support data urls in iframes

## 4.58.3 - 2022/1/12

- fix bugs
- updated to @applitools/eyes-sdk-core@12.24.12 (from 12.24.3)
- updated to @applitools/spec-driver-selenium@1.3.1 (from 1.3.0)
- updated to @applitools/visual-grid-client@15.8.59 (from 15.8.47)
- updated to @applitools/spec-driver-selenium@1.3.2 (from 1.3.1)
- updated to @applitools/eyes-sdk-core@12.24.13 (from 12.24.12)
- updated to @applitools/spec-driver-selenium@1.3.3 (from 1.3.2)
- updated to @applitools/visual-grid-client@15.8.60 (from 15.8.59)
