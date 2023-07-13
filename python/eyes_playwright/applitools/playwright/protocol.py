from __future__ import absolute_import, division, print_function

from applitools.common.protocol import USDKProtocol

from .command_context import PlaywrightSpecDriverCommandContext
from .object_registry import PlaywrightSpecDriverObjectRegistry


class PlaywrightSpecDriver(USDKProtocol):
    _CommandContext = PlaywrightSpecDriverCommandContext
    _ObjectRegistry = PlaywrightSpecDriverObjectRegistry
