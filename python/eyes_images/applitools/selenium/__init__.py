from __future__ import absolute_import, division, print_function

from applitools.common import (
    DeviceName,
    FileLogger,
    MatchLevel,
    RectangleSize,
    Region,
    StdoutLogger,
    TestResultContainer,
    TestResults,
    TestResultsSummary,
    logger,
)
from applitools.common.accessibility import (  # noqa
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AccessibilitySettings,
)
from applitools.common.batch_close import BatchClose  # noqa
from applitools.common.config import BatchInfo  # noqa
from applitools.common.cut import (  # noqa
    FixedCutProvider,
    NullCutProvider,
    UnscaledFixedCutProvider,
)
from applitools.common.extract_text import OCRRegion, TextRegionSettings
from applitools.common.fluent.region import AccessibilityRegionByRectangle  # noqa
from applitools.common.fluent.target_path import TargetPath
from applitools.common.geometry import AccessibilityRegion
from applitools.common.locators import VisualLocator
from applitools.common.selenium import BrowserType, Configuration, StitchMode  # noqa
from applitools.common.server import FailureReports  # noqa
from applitools.common.ultrafastgrid import (  # noqa
    ChromeEmulationInfo,
    DesktopBrowserInfo,
    IosDeviceInfo,
    IosDeviceName,
    IosVersion,
    ScreenOrientation,
)

from .eyes import Eyes
from .fluent.target import Target  # noqa
from .runner import ClassicRunner, RunnerOptions, VisualGridRunner

__all__ = (
    "AccessibilityGuidelinesVersion",
    "AccessibilityLevel",
    "AccessibilityRegion",
    "AccessibilityRegionByRectangle",
    "AccessibilityRegionType",
    "AccessibilitySettings",
    "BatchClose",
    "BatchInfo",
    "BrowserType",
    "ChromeEmulationInfo",
    "ClassicRunner",
    "Configuration",
    "DesktopBrowserInfo",
    "DeviceName",
    "Eyes",
    "FailureReports",
    "FileLogger",
    "FixedCutProvider",
    "IosDeviceInfo",
    "IosDeviceName",
    "IosVersion",
    "MatchLevel",
    "NullCutProvider",
    "OCRRegion",
    "RectangleSize",
    "Region",
    "RunnerOptions",
    "ScreenOrientation",
    "StdoutLogger",
    "StitchMode",
    "Target",
    "TargetPath",
    "TestResultContainer",
    "TestResults",
    "TestResultsSummary",
    "TextRegionSettings",
    "UnscaledFixedCutProvider",
    "VisualGridRunner",
    "VisualLocator",
    "logger",
)
