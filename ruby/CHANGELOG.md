## [5.0.0] - 2023-07-11
### Breaking Changes:
- get_all_test_results return TestResultSummary with additional info
- TestResults Array now in get_all_test_results.results or can be accessed old-style with get_all_test_results[0]
- eyes.close always return first result, even when have failed check
- eyes.abort on closed/aborted eye now return nil
### Added
- Add support for reloading the page when using layout_breakpoints
- add errors to TestResults
### Updated
- Update version of Universal SDK Core to 3.6.0
### Features
- ability to skip deserialize dom snapshot
- prevent animated gif images from playing in ufg
- support custom property per renderer
### Bug fixes
- fixed issue that caused creation of unnecessary tunnels
- start tunnels with proper regional server
## [4.6.3] - 2023-07-04
### Updated
- Update version of Universal SDK Core to 3.4.0
### Added
- Add api for mobile (set_nmg_capabilities, set_mobile_capabilities, use_system_screenshot)
### Features
- Drop support of legacy vhs extraction
- Add an API to send logEvents
- Add support for reloading the page when using layoutBreakpoints
- Fixed issue with failed find element responses in EC
- Fixed issue when on certain browser versions test didn't target a previously created baseline
- added a new mode for taking native app screenshots
### Bug fixes
- Increase timeout for rendering results polling
- Fixed issue when logs are not show up
- Add isProcess property when calling makeCoreServer
- Fixed issue with Safari mobile screenshots
- Fixed issue with default settings in extractText
- Fixed issue with viewport information extraction when switched to webview
- apply default scrolling mode
## [4.6.2] - 2023-05-10
### Added
- Add remove_duplicate_tests option & set_remove_duplicate_tests method to eyes runner 
### Updated
- Update version of Universal SDK Core to 2.5.8
### Features
- Added functional session feature
- Add a timeout and max concurrency for fetching resources
### Bug fixes
- Fixed issue in dom snapshot that prevented urls that start with a whitespace to be mapped
- Improved appium prefixed capabilities parsing
- Fix issue when locate return wrong type of the region, with left and top properties instead of x and y
- Fixed issue with when webview were wasn't recognized as web compatible world
- Fixed the issue with session metadata extraction
- Fixed functional test feature issues in ec client
- Fixed typo in ec custom property
- Fixed issue with hanging requests
- Fixed platform name formatting
- Prevented driver metadata extraction during check in ufg eyes
- Fixed dynamic import issue in universal binaries
- Fixed detection of emulated mobile drivers
- Remove 'Execution Cloud' custom property
## [4.6.1] - 2023-04-12
### Changed
- Packaging server core inside eyes_universal
### Updated
- Update version of Universal SDK Core to 2.4.8
### Features
- Added removeDuplicateTests property to the GetManagerResultsSettings
- Changed makeManager api to accept settings
- Improved extraction of nml element
- Update broker url using last response instead of using driver
### Bug fixes
- Fixed screenshot framing
- Fixed issue with css fetching for dom capture
- Fixed issue with emulation driver detection
- Fixed relative url resolution in css files
- Added timeout to css fetching during preparing dom capture
- Improve performance in DOM snapshot
- Fixed retry interval during poll requests to eyes back-end
- Fixed issue with concurrency of the renders in ufg mode
- Fixed issue with concurrency of the renders in ufg mode
- Fixed ufg concurrency regression
- Replaced broker url cache with nml element cache
- Fixed selector transformation for scroll root elements for ufg
- Upgrade tunnel version
## [4.6.0] - 2023-03-06
### Changed
- change server package to @applitools/core
### Updated
- Improve logging in core server
- Passing density metric for PPI support in the sdk
### Added
- Integrate universal protocol to run core via transport
- Added Resize stitch mode value
- Add NML support for Android
- Add makeECClient api
### Bug fixes
- upgrade dom-snapshot with a fix to CSP
- Fixed issue when .visualgrid was not added to agent id
- Fixed issue with aborting ufg tests
## [4.5.5] - 2023-01-06
### Updated
- Update version of Universal SDK to 3.2.2
## [4.5.4] - 2023-01-04
### Updated
- Update version of Universal SDK to 3.2.1
- Update arm64-darwin server recognition
### Features
- Filter styles and resources with non-screen media queries
### Bug fixes
- Fixed issue with parsing capabilities for iOS with native app
## [4.5.3] - 2022-12-30
### Fixed
- skip yanked gem versions
## [4.5.2] - 2022-12-30
### Updated
- Update version of Universal SDK to 3.2.0
### Added
- Add dont_close_batches flag to eyes [Trello 3093](https://trello.com/c/3E0ilb0A)
### Features
- Add server support for arm
- Additional internal event logs
### Bug fixes
- Fixed OCR functionality with latest eyes server
- Fixed issue when helper lib inputs were not cleaned up before calling new command
- Fixed issue with element scroll position not being restored after screenshot is taken on native platforms
- Handed error during polling in long requests to eyes server
- Handle fake shadowRoot with UFG
## [4.5.1] - 2022-11-28
### Fixed
- releasing as stable all eyes
## [4.0.0.alpha-eyes-images] - 2022-11-28
### Added
- eyes_images updated to universal server sdk(v3)
### Deprecated (eyes_images)
- eyes_images inputs Applitools::Screenshot and ChunkyPNG::Image now are image_path and image (examples in spec/images/eyes_images_functional_spec.rb)
### Added (eyes_images)
- eyes_images: Applitools::MatchLevel::IGNORE_COLORS
## [4.5.0.alpha] - 2022-11-23
- Update version of Universal SDK to v3 (sdk: 3.0.2)
## [4.4.1] - 2022-10-03
### Added
- Added iPhone 14 and iPhone 14 Pro Max devices [Trello 73](https://trello.com/c/M1YiwtHb)
## [4.4.0] - 2022-09-16
### Updated
- Update version of Universal SDK to 2.12.3
### Added
- Created testing client for eyes-universal
### Fixed
- Using lazyLoad.waitingTime as a delay between stitches by default
- Using proxy while polling for the result of the nml command
## [4.3.0] - 2022-09-16
### Updated
- Update version of Universal SDK to 2.12.0
### Added
- Add proxy support when using NML for NMG
- Add NML NMG support for iOS
- Added support for lazy loading views in android native apps
- tests for alpine
### Fixed
- Sending correct commands with android helper lib
- Fixed issue that prevented NMG from working when NML was enabled
## [4.2.0] - 2022-09-05
### Removed
- removed device name Galaxy S8, S8 Plus, Note 8
## [4.1.4] - 2022-09-02
### Updated
- Update version of Universal SDK to 2.10.8
### Changed
- U-SDK server spawn once per process
- U-SDK server shutdown-mode changed
## [4.1.4.alpha] - 2022-08-15
### Updated
- Update version of Universal SDK to 2.10.5
### Changed
- ci moved to github
## [4.1.3] - 2022-08-04
### Added
- add enum for edge-2 (EDGE_CHROMIUM_TWO_VERSIONS_BACK)
- Android 12 device name [Trello 54](https://trello.com/c/SZAPDKSI)
### Updated
- Update version of Universal SDK to 2.10.3
## [4.1.2] - 2022-07-07
### Added
- add padding support for regions [Trello 2929](https://trello.com/c/kHbnEdC7), [Trello 42](https://trello.com/c/PYKqJLbg)
- add custom region id support for regions [Trello 47](https://trello.com/c/pv51sCYA)
### Updated
- Update version of Universal SDK to 2.9.5
### Fixed
- fix freeze in communication with universal server
- fix floating region bounds option(as 4 numbers) parsing
## [4.1.1] - 2022-06-16
### Added
- add support lazy loading as part of the check-api [Trello](https://trello.com/c/BIHFMhVk)
### Updated
- Update version of Universal SDK to 2.8.0
## [4.1.0] - 2022-06-16
### Removed
- alpha flag from version number
## [4.1.0.alpha] - 2022-06-13
### Updated
- Update version of Universal SDK to 2.7.2
## Removed
- removed eventmachine from eyes_core
## [4.0.5.4] - 2022-06-10
### Updated
- Update version of Universal SDK to 2.7.1
### Fixed
- Fix default boolean field transition to server(like full page screenshot)
## [4.0.5.3] - 2022-06-02
### Updated
- Update version of Universal SDK to 2.5.19
### Fixed
- fix ruby-3.1 installation collision
## [4.0.5.2] - 2022-05-24
### Updated
- Update version of Universal SDK to 2.5.17
### Fixed
- Fix closing batches with closeManager
## Removed
- removed nokogiri frozen version
- remove old&unused js(now processed by universal server)
## [4.0.5.1] - 2022-05-18
### Fixed
- Fix wrong gem yank
## [4.0.5] - 2022-05-18
### Updated
- Update version of Universal SDK to 2.5.11
### Fixed
- Fix for default notify_on_completion value(moved to universal server)
## [4.0.4] - 2022-05-13
### Fixed
- Fix for mingw
## [4.0.3] - 2022-05-13
### Updated
- Update version of Universal SDK to 2.5.7
### Added
- added api: wait_before_capture, page_id
- api for native ufg: add_mobile_device, add_mobile_devices
- new ios devices
- AndroidDeviceName and AndroidDeviceInfo
### Fixed
- Fix installing universal server issues on windows
- fix getting connection info for universal server on ci
## Removed
- png processing lib dependecies
## [4.0.2] - 2022-02-08
### Updated
- Update version of Universal SDK to 1.0.9
### Fixed
- Fix installing issues with latest ruby version and installing on windows
## [4.0.1] - 2022-02-08 - unreleased
### Updated
- Update version of Universal SDK to 1.0.7
## [4.0.0] - 2022-01-24
### Changed
- Library is now based on Universal SDK
## [3.18.4] - 2021-08-31
### Fixed
- Fix Appium runner option [Trello 2697](https://trello.com/c/F6dLF1VF)
- Fix parsing css transition [Trello 2647](https://trello.com/c/CIzoKPNY)
- Fix require warning: No such file or directory @ dir_chdir - lib/applitools/selenium/scripts/node_modules [Trello 2148](https://trello.com/c/j5sAPSBa)
## [3.18.3] - 2021-06-24
### Added
- Support cross origin iframes in UFG [Trello 2259](https://trello.com/c/iJKPvd75), [Trello 2584](https://trello.com/c/QyLzmnGl)
## [3.18.2] - 2021-05-05
### Added
- Support variation_group_id and agentRunId [Trello 2527](https://trello.com/c/6SyxJXVZ)
## [3.18.1] - 2021-04-28
### Added
- Allow defining custom properties at the batch level [Trello 2445](https://trello.com/c/IKTydXLv)
## [3.18.0] - 2021-04-20
### Fixed
- Fix Selenium and Appium libraries conflict [Trello 2500](https://trello.com/c/UOwzI2s8)
## Deprecated
- Ruby 1.9 support for Appium lib (Requirement 2.2+)
## [3.17.23] - 2021-01-22
### Fixed
- Fix viewport rect of a native app at some android devices [Trello 2079](https://trello.com/c/sQJLgtUL)
### Updated
- Update Ruby Coverege Tests to v2
## [3.17.22] - 2021-01-12
### Added
- Supporting check full element with ufg [Trello 2145](https://trello.com/c/8tPAnz66)
### Updated
- Supporting iPhone 12 in `IosDeviceName` class. [Trello 2269](https://trello.com/c/yWFy2pRE)
### Fixed
- Restart on calling eyes.open with started driver [Trello 2162](https://trello.com/c/1SCQUUnW), [Trello 2233](https://trello.com/c/yPY3jhjW)
## [3.17.21] - 2020-08-20
### added
- UFG: the ability to set :visual_grid_options for the UFG SDK (Both globally and through the fluent interface) [Trello_2089](https://trello.com/c/d4zggQes/2089-ufg-sdks-visualgridoptionspolyfilladoptedstylesheets)
## [3.17.20] - 2020-08-20
### fixed
- Skip resources list: the errorStatusCode is passed to the server for UFG resources (if present) [Trello_2101](https://trello.com/c/vw3Ag8eO/2101-sdk-doesnt-pass-errorstatuscode-for-ufg-resources-if-an-error-occurred)
## [3.17.19] - 2020-08-18
### Updated
- Skip resources list for UFG is implemented [Trello_1974](https://trello.com/c/44xq8dze/1974-dom-snapshot-should-accept-a-skip-list-for-fetched-resources)
## [3.17.18] - 2020-08-01
### Fixed
- appium region screenshot issue [Trello_1996](https://trello.com/c/bmD4fCbs/1996-appium-native-ruby-error-with-png-signature-for-targetregion)
## [3.17.17] - 2020-07-29
### Fixed
- The availability to set :notify_on_completion manually for Applitools::BatchInfo. [Trello_2012](https://trello.com/c/OdYXtkFI/2012-batch-sequence-and-batch-notifications-are-not-working-in-the-ruby-selenium-sdk)
### Updated
- Screenshot retry mechanism is now more efficient. [Trello 1866](https://trello.com/c/KyxkI6Bu)
## [3.17.16] - 2020-07-16
### Fixed
- The test name is not updated in case of double open->check->close call. [Trello 2011](https://trello.com/c/7UN1AbYU/2011-ruby-ufg-tests-creates-tests-out-of-order-when-classic-eyesopen-is-used)
## [3.17.15] - 2020-07-16
### Added
- Added `VisualViewport` for UFG client. [Trello 1957](https://trello.com/c/jWvdBwex/1957-add-visual-viewport-support-in-the-ui-for-mobile-devices)
## [3.17.14] - 2020-07-9
### Updated
- Added missing `StitchingService` URI field in `RenderRequest`. [Trello 1988](https://trello.com/c/Yr6EsUlL)
## [3.17.13] - 2020-07-03
## Fixed
- eyes_appium: Coded Floating Regions Incorrectly Placed [Trello_1960](https://trello.com/c/j6nJh1LS/1960-ruby-native-app-coded-floating-regions-incorrectly-placed)
- eyes_images: Simple eyes_images test is broken [Trello_1949](https://trello.com/c/dHQbz96i/1949-eyesimages-seem-to-be-broken)
## [3.17.12] - 2020-07-02
## Fixed
- :match_timeout property is moved to configuration object [Trello_1935](https://trello.com/c/2Z070Qgs/1935-ruby-selenium-matchtimeout-not-available-in-the-configuration-object)
## [3.17.11] - 2020-06-25
## Fixed
- IosDeviceOrientation is replaced by Orientation [Trello_1944](https://trello.com/c/EzyG7525/1944-ufg-safari-on-ios-orientations-changes)
## [Eyes.sdk.ruby 3.17.10] - 2020-06-20
## Fixed
- a configuration shared between Eyes instances in Rspec [Trello_1938](https://trello.com/c/qOQkbDO7/1938-a-configuration-shared-between-eyes-instances-in-rspec)
## [Eyes.sdk.ruby 3.17.9] - 2020-06-19
## Fixed
- Call :clone on a NilClass for ruby 2.3 [Trello_1855](https://trello.com/c/LCBhnTMd/1885-selenium-ruby-cant-clone-nilclass)
## [Eyes.sdk.ruby 3.17.7] - 2020-06-18
## Added
- eyes.ignore_displacements= and eyes.ignore_displacements methods [Trello_841](https://trello.com/c/uwrYb1Vj/841-add-a-general-method-for-ignoredisplacements?menu=filter&filter=visual%20loca,due:notdue)
## Fixed
- Encoded regions for 'selector' mode [Trello_1915](https://trello.com/c/BQIrbCfC/1915-ruby-ultrafast-grid-incorrect-placement-of-coded-regions-for-targetregion)
## [Eyes.sdk.ruby 3.17.6] - 2020-06-16
## Fixed
- config.add_device_emulation(name, orientation) is fixed [Trello_1914](https://trello.com/c/l7WRvhSP/1914-ruby-ultrafast-grid-adddeviceemulation-throws-error-after-upgrading-to-3175?menu=filter&filter=due:notdue)
## Added
- Appium driver support is ectended (Applitools::Appium::Eyes.new(driver: Appium::Driver.new)) [Trello_1913](https://trello.com/c/wQTgRNrN/1913-appium-ruby-regression-unknown-driver-appiumdriver0x00007fbaf9903448-applitoolseyeserror?menu=filter&filter=due:notdue)
## [Eyes.sdk.ruby 3.17.5] - 2020-06-15
## Added
- The ability to set :baseline_env_name for DesktopBrowserInfo, IosDeviceInfo and ChromeEmulationInfo
## Fixed
- IosScreenOrientation instead of the IosScreenshotOrientation
## [Eyes.sdk.ruby 3.17.4] - 2020-06-11
## Fixed
- restricted to set emulation_info && ios_device_info for DesktopBrowserInfo
## [Eyes.sdk.ruby 3.17.3] - 2020-06-06
## Deprecated
- BrowserTypes module is deprecated in a favor of BrowserType
- Orientations module is deprecated in a favor of Orientation
## Fixed
- IosDeviceOrientation instead of IosDeviceOrientations(plural)
## Deprecated
## [Eyes.sdk.ruby 3.17.2] - 2020-06-06
## Added
- safari on ios device emulation for UFG [Trello_1872](https://trello.com/c/bykk2rzB/1872-ufg-safari-on-ios-simulators-support)
## [Eyes.sdk.ruby 3.17.1] - 2020-05-26
## Fixed
- eyes.properties for VG [Trello_1804](https://trello.com/c/Jt2BYz0e/1804-ruby-selenium-addproperty-method-not-recognized-when-running-with-visualgridrunner)
- SessionStartInfo parameters were not passed to Json correctly
## [Eyes.sdk.ruby 3.17.0] - 2020-05-18
## Added
- eyes.accessibility_validation(Applitools::AccessibilitySettings.new(Applitools::AccessibilityLevel::AA, Applitools::AccessibilityVersion::WCAG_2_0)) - [Trello_1767](https://trello.com/c/gq69woeK/1767-all-sdks-accessibility-accessiblity-guidelines-version-support-and-additional-verifications?menu=filter&filter=due:notdue)
## Removed
- eyes.accessibility_level
## [Eyes.sdk.ruby 3.16.16] - 2020-04-28
## Added
- Regions support for eyes_appium (Target#ignore, Target#floating, Target#accessibility, Target#layout, etc.)
## [Eyes.sdk.ruby 3.16.15] - 2020-04-24
## Deprecated
- BrowserTypes::EDGE is deprecated. Please change it to either "EDGE_LEGACY" for the legacy version or to "EDGE_CHROMIUM" for the new Chromium-based version. [Trello 1757](https://trello.com/c/LUe43aee/1757-all-ultrafast-sdks-edge-chromium-support)
## [Eyes.sdk.ruby 3.16.14] - 2020-04-10
## Added
-  new_session? flag is taken from start_session server response with fallback to the status code [Trello_1715](https://trello.com/c/DcVzWbeR/1715-all-sdks-updated-long-running-task-mode-for-startsession) 
## [Eyes.sdk.ruby 3.16.13] - 2020-04-06
## Fixed
- eyes#hide_scrollbars is true by default [Trello 1592](https://trello.com/c/MXixwLnj/1592-upload-dom-directly-to-azure)
- eyes#ignore_caret has been included tothe configuration object [Trello)_1706](https://trello.com/c/16JqYlYb/1706-ignorecaret-globally-is-missing-ruby)
- Irrelevant URLs are excluded from SVG resource parsing results [Trello 1691](https://trello.com/c/EAIpEh8s/1691-ruby-vg-parsing-of-irrelevant-urls-from-css-and-svg-resources)
## Added
-  x-applitools-eyes-client header for all API requests [Trello_1697](https://trello.com/c/CzhUxOqE/1697-all-sdks-should-report-their-version-in-all-requests-to-the-eyes-server) 
## [Eyes.sdk.ruby 3.16.12] - 2020-03-30
## Fixed
- eyes#send_dom didn't work [Trello 1659](https://trello.com/c/9CfD0fhn/1659-disable-dom-capturing-is-not-working-on-the-test-level-ruby)
## [Eyes.sdk.ruby 3.16.11] - 2020-03-27
## Fixed
- dom_capture threw an exception on a particular page [Trello 1658](https://trello.com/c/x0uYFwx0/1658-test-is-being-aborted-when-trying-to-capture-dom-ruby)
## [Eyes.sdk.ruby 3.16.10] - 2020-03-24
## Added
- The ability to use different Faraday adapters instead the default one [Trello 1683](https://trello.com/c/6IASHoBB/1683-add-http2-support-to-the-communication-library)
- The ability to set up timeout for HTTP request
- The ability to set up timeout for an Applitools::Future
## [Eyes.sdk.ruby 3.16.9] - 2020-03-17
## Fixed
- Agent ID for eyes_appium set to eyes.appium.ruby/version
## [Eyes.sdk.ruby 3.16.8] - 2020-03-13
## Fixed
- SDK fetch resources: the request header 'Accept-Language' is used along with 'User-Agent'
- Timeout for Thread.join is increased up to Faraday's connection timeout
- Error handling for resources that failed to fetch
## Added
-  Log messages for resource fetching now include the URL and status code
## [Eyes.sdk.ruby 3.16.7] - 2020-03-06
### Added
- dom_snapshot is uploaded directly to Azure storage
### Fixed
- dom_snapshot script updated to 7.1.3
- send_dom is true by default for EyesSelenium
## [Eyes.sdk.ruby 3.16.6] - 2020-03-05
### Fixed
- eyes#check might be called as #check(tag, target) as well as #check(target)
- Selenium Eyes: ignore regions in the current target caused an exception 
## [Eyes.sdk.ruby 3.16.5] - 2020-03-02
### Fixed
- double slash issue for custom server URL
## [Eyes.sdk.ruby 3.16.2] - 2020-02-06
### Fixed
- DefaultMatchSettings being overridden incorrectly by ImageMatchSettings
## [Eyes.sdk.ruby 3.16.1] - 2020-01-29
### Fixed
- eyes_appium crashed trying to get viewport_size
### Added
- long_requests are used for start session
## [Eyes.sdk.ruby 3.16.0] - 2020-01-24
### Added
- Screenshot uploading direct to cloud store
## [Eyes.sdk.ruby 3.15.48] - 2020-01-20
### Added
- New browser types for the VisualGrid (CHROME, CHROME_ONE_VERSION_BACK, CHROME_TWO_VERSIONS_BACK, FIREFOX, FIREFOX_ONE_VERSION_BACK, FIREFOX_TWO_VERSIONS_BACK, SAFARI, SAFARI_ONE_VERSION_BACK, SAFARI_TWO_VERSIONS_BACK, IE_10, IE_11, EDGE)
## [Eyes.sdk.ruby 3.15.47] - 2020-01-08
### Fixed
- eyes_images throws "undefined method `each' for nil:NilClass (NoMethodError)"
## [Eyes.sdk.ruby 3.15.43] - 2019-12-20
### Removed
- delta compression for screenshots
## [Eyes.sdk.ruby 3.15.43] - 2019-12-19
### Added
- eyes.abort_async method implementation
### Fixed
- save_new_tests is true by default
- tests are aborted instead of being closed on render fail
## [Eyes.sdk.ruby 3.15.43] - 2019-12-12
### Added
- Return empty test if the render fails
- eyes.abort method
## [Eyes.sdk.ruby 3.15.42] - 2019-12-10
### Fixed
- CSS paring & fetching font urls
- VisualGridEyes#config renamed to #configuration
- VisualGridEyes.configuration returns a clone of a configuration object
## [Eyes.sdk.ruby 3.15.41] - 2019-11-06
### Fixed
- Various VG related bugs
## [Eyes.sdk.ruby 3.15.39] - 2019-11-06
### Added
- This CHANGELOG file.
### Fixed
- Chrome 78 css stitching bug
