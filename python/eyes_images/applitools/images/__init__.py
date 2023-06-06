from __future__ import absolute_import, division, print_function

from applitools.common import (
    BatchInfo,
    Configuration,
    FileLogger,
    MatchLevel,
    StdoutLogger,
    TestResultContainer,
    TestResults,
    TestResultsSummary,
    logger,
)
from applitools.common.accessibility import (
    AccessibilityGuidelinesVersion,
    AccessibilityLevel,
    AccessibilityRegionType,
    AccessibilitySettings,
)
from applitools.common.batch_close import BatchClose
from applitools.common.cut import (
    FixedCutProvider,
    NullCutProvider,
    UnscaledFixedCutProvider,
)
from applitools.common.fluent.region import AccessibilityRegionByRectangle
from applitools.common.geometry import AccessibilityRegion, RectangleSize, Region

from .extract_text import OCRRegion, TextRegionSettings
from .eyes import Eyes
from .fluent import Target

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
