import os
import sys

import pytest

no_playwright = sys.version_info < (3, 7) or os.path.exists("/etc/alpine-release")


def test_core_internal_imports():
    with pytest.warns(ImportWarning):
        from applitools.core.batch_close import BatchClose
        from applitools.core.cut import (
            FixedCutProvider,
            NullCutProvider,
            UnscaledFixedCutProvider,
        )
        from applitools.core.extract_text import OCRRegion, TextRegionSettings
        from applitools.core.feature import Feature
        from applitools.core.fluent.check_settings import (
            CheckSettings,
            CheckSettingsValues,
        )
        from applitools.core.fluent.region import (
            AccessibilityRegionByRectangle,
            FloatingRegionByRectangle,
            GetFloatingRegion,
            GetRegion,
            RegionByRectangle,
        )
        from applitools.core.locators import VisualLocator, VisualLocatorSettings
        from applitools.core.triggers import MouseTrigger, TextTrigger


def test_common_internal_imports():
    from applitools.common.accessibility import (
        AccessibilityGuidelinesVersion,
        AccessibilityLevel,
        AccessibilityRegionType,
        AccessibilitySettings,
    )
    from applitools.common.config import BatchInfo, Configuration, ProxySettings
    from applitools.common.errors import (
        DiffsFoundError,
        EyesError,
        NewTestError,
        OutOfBoundsError,
        TestFailedError,
        USDKFailure,
    )
    from applitools.common.geometry import (
        AccessibilityRegion,
        CoordinatesType,
        Point,
        RectangleSize,
        Region,
        SubregionForStitching,
    )
    from applitools.common.layout_breakpoints_options import LayoutBreakpointsOptions
    from applitools.common.logger import FileLogger, StdoutLogger
    from applitools.common.match import (
        ExactMatchSettings,
        FloatingBounds,
        FloatingMatchSettings,
        ImageMatchSettings,
        MatchLevel,
        MatchResult,
    )
    from applitools.common.selenium.config import Configuration
    from applitools.common.selenium.misc import BrowserType, StitchMode
    from applitools.common.server import FailureReports, ServerInfo, SessionType
    from applitools.common.test_results import (
        TestResultContainer,
        TestResults,
        TestResultsStatus,
        TestResultsSummary,
    )
    from applitools.common.ultrafastgrid.config import (
        AndroidDeviceName,
        AndroidVersion,
        DeviceName,
        IosDeviceName,
        IosVersion,
        ScreenOrientation,
        VisualGridOption,
    )
    from applitools.common.ultrafastgrid.render_browser_info import (
        AndroidDeviceInfo,
        ChromeEmulationInfo,
        DesktopBrowserInfo,
        IosDeviceInfo,
    )


def test_common_internal_compat_imports():
    from applitools.common import logger
    from applitools.common.logger import FileLogger, StdoutLogger


def test_images_internal_imports():
    from applitools.images.extract_text import OCRRegion, TextRegionSettings
    from applitools.images.eyes import Eyes
    from applitools.images.fluent import Target


def test_selenium_internal_imports():
    from applitools.selenium.eyes import Eyes
    from applitools.selenium.fluent.target import Target
    from applitools.selenium.fluent.target_path import TargetPath
    from applitools.selenium.runner import (
        ClassicRunner,
        RunnerOptions,
        VisualGridRunner,
    )


@pytest.mark.skipif(no_playwright, reason="Test requires playwright support")
def test_playwright_internal_imports():
    from applitools.playwright.eyes import Eyes
    from applitools.playwright.runner import ClassicRunner, VisualGridRunner
