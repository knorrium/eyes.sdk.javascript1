import os
import sys

import pytest

no_playwright = sys.version_info < (3, 7) or os.path.exists("/etc/alpine-release")


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


@pytest.mark.skipif(no_playwright, reason="Test requires playwright support")
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


def test_import_common_version():
    from applitools.common import __version__ as common_version

    assert common_version.startswith("5")


def test_import_images_version():
    from applitools.images import __version__ as images_version
    from applitools.images.__version__ import __version__ as images_version_alias

    assert images_version == images_version_alias


def test_import_selenium_version():
    from applitools.selenium import __version__ as selenium_version
    from applitools.selenium.__version__ import __version__ as selenium_version_alias

    assert selenium_version == selenium_version_alias


def test_import_eyes_library_version():
    from EyesLibrary import __version__ as eyes_library_version
    from EyesLibrary.__version__ import __version__ as eyes_library_version_alias

    assert eyes_library_version == eyes_library_version_alias


@pytest.mark.skipif(no_playwright, reason="Test requires playwright support")
def test_import_playwright_version():
    from applitools.playwright import __version__ as playwright_version

    assert playwright_version.startswith("5")
