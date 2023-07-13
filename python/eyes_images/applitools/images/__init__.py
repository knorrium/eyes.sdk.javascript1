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
from applitools.common.config import BatchInfo, Configuration
from applitools.common.cut import (
    FixedCutProvider,
    NullCutProvider,
    UnscaledFixedCutProvider,
)
from applitools.common.fluent.region import AccessibilityRegionByRectangle
from applitools.common.geometry import AccessibilityRegion, RectangleSize, Region
from applitools.common.logger import FileLogger, StdoutLogger
from applitools.common.match import MatchLevel
from applitools.common.test_results import (
    TestResultContainer,
    TestResults,
    TestResultsSummary,
)

from .extract_text import OCRRegion, TextRegionSettings
from .eyes import Eyes
from .fluent import Target

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
    "Configuration",
    "Eyes",
    "FileLogger",
    "FixedCutProvider",
    "MatchLevel",
    "NullCutProvider",
    "OCRRegion",
    "RectangleSize",
    "Region",
    "StdoutLogger",
    "Target",
    "TestResultContainer",
    "TestResults",
    "TestResultsSummary",
    "TextRegionSettings",
    "UnscaledFixedCutProvider",
    "logger",
)


class _DummyVersionModule(str):
    @property  # applitools.images <=5.19 had __version__ module with __version__ attr
    def __version__(self):
        return str(self)


__version__ = _DummyVersionModule(__version__)
sys.modules[__name__ + ".__version__"] = __version__  # noqa
