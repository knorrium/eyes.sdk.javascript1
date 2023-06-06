def test_core_root_package_imports():
    from applitools.core import (
        BatchClose,
        CheckSettings,
        CheckSettingsValues,
        Feature,
        FixedCutProvider,
        FloatingRegionByRectangle,
        GetFloatingRegion,
        GetRegion,
        MouseTrigger,
        NullCutProvider,
        RegionByRectangle,
        TextRegionSettings,
        TextTrigger,
        UnscaledFixedCutProvider,
        VisualLocator,
        VisualLocatorSettings,
    )


def test_common_root_package_imports():
    from applitools.common import (
        AccessibilityGuidelinesVersion,
        AccessibilityLevel,
        AccessibilityRegion,
        AccessibilityRegionType,
        AccessibilitySettings,
        ChromeEmulationInfo,
        CoordinatesType,
        DesktopBrowserInfo,
        DeviceName,
        DiffsFoundError,
        ExactMatchSettings,
        EyesError,
        FailureReports,
        FloatingBounds,
        FloatingMatchSettings,
        ImageMatchSettings,
        LayoutBreakpointsOptions,
        MatchLevel,
        MatchResult,
        NewTestError,
        OutOfBoundsError,
        Point,
        RectangleSize,
        Region,
        ScreenOrientation,
        ServerInfo,
        SessionType,
        StitchMode,
        SubregionForStitching,
        TestFailedError,
        TestResultContainer,
        TestResults,
        TestResultsStatus,
        TestResultsSummary,
        USDKFailure,
    )


def test_common_root_package_compat_imports():
    from applitools.common import FileLogger, StdoutLogger, logger


def test_common_internal_imports():
    # these were missing from applitools.common package root
    from applitools.common.errors import USDKFailure
    from applitools.common.test_results import TestResultsStatus


def test_images_root_package_imports():
    from applitools.images import (
        AccessibilityGuidelinesVersion,
        AccessibilityLevel,
        AccessibilityRegion,
        AccessibilityRegionByRectangle,
        AccessibilityRegionType,
        AccessibilitySettings,
        BatchClose,
        BatchInfo,
        Configuration,
        Eyes,
        FixedCutProvider,
        MatchLevel,
        NullCutProvider,
        OCRRegion,
        RectangleSize,
        Region,
        Target,
        TestResultContainer,
        TestResults,
        TestResultsSummary,
        TextRegionSettings,
        UnscaledFixedCutProvider,
    )


def test_images_root_package_compat_imports():
    # these are dummy objects, kept to avoid breaking existing code
    from applitools.images import FileLogger, StdoutLogger, logger


def test_selenium_root_package_imports():
    from applitools.selenium import (
        AccessibilityGuidelinesVersion,
        AccessibilityLevel,
        AccessibilityRegion,
        AccessibilityRegionByRectangle,
        AccessibilityRegionType,
        AccessibilitySettings,
        BatchClose,
        BatchInfo,
        BrowserType,
        ChromeEmulationInfo,
        ClassicRunner,
        Configuration,
        DesktopBrowserInfo,
        DeviceName,
        Eyes,
        FailureReports,
        FixedCutProvider,
        IosDeviceInfo,
        IosDeviceName,
        IosVersion,
        MatchLevel,
        NullCutProvider,
        OCRRegion,
        RectangleSize,
        Region,
        RunnerOptions,
        ScreenOrientation,
        StitchMode,
        Target,
        TargetPath,
        TestResultContainer,
        TestResults,
        TestResultsSummary,
        TextRegionSettings,
        UnscaledFixedCutProvider,
        VisualGridRunner,
    )


def test_selenium_root_package_compat_imports():
    # these are dummy objects, kept to avoid breaking existing code
    from applitools.images import FileLogger, StdoutLogger, logger


def test_playwright_root_package_import():
    from applitools.playwright import (
        AccessibilityGuidelinesVersion,
        AccessibilityLevel,
        AccessibilityRegion,
        AccessibilityRegionByRectangle,
        AccessibilityRegionType,
        AccessibilitySettings,
        BatchClose,
        BatchInfo,
        BrowserType,
        ChromeEmulationInfo,
        ClassicRunner,
        Configuration,
        DesktopBrowserInfo,
        DeviceName,
        Eyes,
        FailureReports,
        FixedCutProvider,
        IosDeviceInfo,
        IosDeviceName,
        IosVersion,
        MatchLevel,
        NullCutProvider,
        OCRRegion,
        RectangleSize,
        Region,
        RunnerOptions,
        ScreenOrientation,
        StitchMode,
        Target,
        TargetPath,
        TestResultContainer,
        TestResults,
        TestResultsSummary,
        TextRegionSettings,
        UnscaledFixedCutProvider,
        VisualGridRunner,
    )
