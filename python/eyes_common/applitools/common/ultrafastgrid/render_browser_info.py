from __future__ import absolute_import, division, print_function

from typing import Any, Dict, List, Optional, Text

import attr

from ..geometry import RectangleSize
from ..selenium.misc import BrowserType
from .config import (
    AndroidDeviceName,
    AndroidVersion,
    DeviceName,
    IosDeviceName,
    IosVersion,
    ScreenOrientation,
)


class IRenderBrowserInfo(object):
    viewport_size = None
    width = 0
    height = 0


@attr.s
class EmulationBaseInfo(object):
    device_name = attr.ib()  # type: DeviceName
    screen_orientation = attr.ib()  # type: ScreenOrientation


@attr.s(hash=True)
class ChromeEmulationInfo(IRenderBrowserInfo):
    device_name = attr.ib(converter=DeviceName)
    screen_orientation = attr.ib(
        default=ScreenOrientation.PORTRAIT, converter=ScreenOrientation
    )  # type: ScreenOrientation
    # backward compatibility with sdk versions<5
    baseline_env_name = attr.ib(default=None)
    browser = BrowserType.CHROME.value
    platform = "linux"


@attr.s(hash=True)
class IosDeviceInfo(IRenderBrowserInfo):
    device_name = attr.ib(converter=IosDeviceName)
    screen_orientation = attr.ib(
        default=ScreenOrientation.PORTRAIT, converter=ScreenOrientation
    )  # type: Optional[ScreenOrientation]
    ios_version = attr.ib(
        default=None, converter=attr.converters.optional(IosVersion)
    )  # type: Optional[IosVersion]
    # backward compatibility with sdk versions<5
    baseline_env_name = attr.ib(default=None)
    browser = BrowserType.SAFARI.value
    platform = "ios"


@attr.s(hash=True)
class AndroidDeviceInfo(IRenderBrowserInfo):
    device_name = attr.ib(converter=AndroidDeviceName)
    screen_orientation = attr.ib(
        default=None, converter=attr.converters.optional(ScreenOrientation)
    )  # type: Optional[ScreenOrientation]
    android_version = attr.ib(
        type=AndroidVersion, default=None
    )  # type: Optional[AndroidVersion]


@attr.s(hash=True)
class DesktopBrowserInfo(IRenderBrowserInfo):
    width = attr.ib(type=int)
    height = attr.ib(type=int)
    browser_type = attr.ib(default=BrowserType.CHROME, converter=BrowserType)
    # backward compatibility with sdk versions<5
    baseline_env_name = attr.ib(default=None)

    @property
    def browser(self):
        # type: () -> Text
        return self.browser_type.value

    @property
    def platform(self):
        # type: () -> Text
        if self.browser_type in [
            BrowserType.IE_10,
            BrowserType.IE_11,
            BrowserType.EDGE_LEGACY,
        ]:
            return "windows"
        elif self.browser_type in [
            BrowserType.SAFARI,
            BrowserType.SAFARI_ONE_VERSION_BACK,
            BrowserType.SAFARI_TWO_VERSIONS_BACK,
            BrowserType.SAFARI_EARLY_ACCESS,
        ]:
            return "mac os x"
        return "linux"


@attr.s(hash=True)
class EnvironmentInfo(IRenderBrowserInfo):
    render_environment_id = attr.ib(default=None)  # type: Optional[Text]
    ec_session_id = attr.ib(default=None)  # type: Optional[Text]
    os = attr.ib(default=None)  # type: Optional[Text]
    os_info = attr.ib(default=None)  # type: Optional[Text]
    hosting_app = attr.ib(default=None)  # type: Optional[Text]
    hosting_app_info = attr.ib(default=None)  # type: Optional[Text]
    device_name = attr.ib(default=None)  # type: Optional[Text]
    viewport_size = attr.ib(default=None)  # type: Optional[RectangleSize]
    user_agent = attr.ib(default=None)  # type: Optional[Text]
    renderer = attr.ib(default=None)  # type: Optional[Dict[Text, Any]]
    raw_environment = attr.ib(default=None)  # type: Optional[Dict[Text, Any]]
    properties = attr.ib(default=None)  # type: Optional[List[Dict[Text, Any]]]
