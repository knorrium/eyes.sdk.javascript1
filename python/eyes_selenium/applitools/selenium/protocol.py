from __future__ import absolute_import, division, print_function

from applitools.common.protocol import USDKProtocol

from .object_registry import SeleniumWebdriverObjectRegistry


class SeleniumWebDriver(USDKProtocol):
    _ObjectRegistry = SeleniumWebdriverObjectRegistry
