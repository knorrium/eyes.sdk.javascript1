from __future__ import absolute_import, division, print_function

import sys

from applitools.common import logger
from applitools.common.accessibility import (
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AccessibilitySettings,
)
from applitools.common.batch_close import BatchClose
from applitools.common.config import BatchInfo
from applitools.common.cut import (
    FixedCutProvider,
    NullCutProvider,
    UnscaledFixedCutProvider,
)
from applitools.common.extract_text import OCRRegion, TextRegionSettings
from applitools.common.fluent.region import AccessibilityRegionByRectangle
from applitools.common.fluent.target_path import TargetPath
from applitools.common.geometry import AccessibilityRegion, RectangleSize, Region
from applitools.common.locators import VisualLocator
from applitools.common.logger import FileLogger, StdoutLogger
from applitools.common.match import MatchLevel
from applitools.common.selenium.config import Configuration
from applitools.common.selenium.misc import BrowserType, StitchMode
from applitools.common.server import FailureReports
from applitools.common.test_results import (
    TestResultContainer,
    TestResults,
    TestResultsSummary,
)
from applitools.common.ultrafastgrid import (
    ChromeEmulationInfo,
    DesktopBrowserInfo,
    DeviceName,
    IosDeviceInfo,
    IosDeviceName,
    IosVersion,
    ScreenOrientation,
)

from .eyes import Eyes
from .fluent.target import Target
from .runner import ClassicRunner, RunnerOptions, VisualGridRunner

__version__ = "5.20.0"

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


class _DummyVersionModule(str):
    @property  # applitools.selenium <=5.19 had __version__ module with __version__ attr
    def __version__(self):
        return str(self)


__version__ = _DummyVersionModule(__version__)
sys.modules[__name__ + ".__version__"] = __version__  # noqa
