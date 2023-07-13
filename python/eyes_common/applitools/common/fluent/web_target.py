from __future__ import absolute_import, division, print_function

from typing import TYPE_CHECKING, Optional, Text, TypeVar, overload

from .web_check_settings import WebCheckSettings

if TYPE_CHECKING:
    from ..utils.custom_types import (
        AnyWebElement,
        BySelector,
        CssSelector,
        FrameIndex,
        FrameNameOrId,
    )
    from . import Region
    from .target_path import RegionLocator

__all__ = ("WebTarget",)

Self = TypeVar("Self", bound="WebCheckSettings")


class WebTarget(object):
    """
    Target for an eyes.check_window/region.
    """

    CheckSettings = WebCheckSettings

    @classmethod
    def window(cls):
        # type: () -> Self.CheckSettings
        return cls.CheckSettings()

    @classmethod
    @overload
    def region(cls, region):
        # type: (Region) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def region(cls, css_selector):
        # type: (CssSelector) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def region(cls, element):
        # type: (AnyWebElement) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def region(cls, by_selector):
        # type: (BySelector) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def region(cls, target_path):
        # type: (RegionLocator) -> Self.CheckSettings
        pass

    @classmethod
    def region(cls, region):
        return cls.CheckSettings().region(region)

    @classmethod
    @overload
    def frame(cls, frame_name_or_id):
        # type: (FrameNameOrId) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def frame(cls, frame_element):
        # type: (AnyWebElement) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def frame(cls, frame_index):
        # type: (FrameIndex) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def frame(cls, frame_by_selector):
        # type: (BySelector) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def frame(cls, target_path):
        # type: (RegionLocator) -> Self.CheckSettings
        pass

    @classmethod
    def frame(cls, frame):
        return cls.CheckSettings().frame(frame)

    @classmethod
    @overload
    def webview(cls, use_default=True):
        # type: (Optional[bool]) -> Self.CheckSettings
        pass

    @classmethod
    @overload
    def webview(cls, webview_id):
        # type: (Text) -> Self.CheckSettings
        pass

    @classmethod
    def webview(cls, webview=True):
        return cls.CheckSettings().webview(webview)
