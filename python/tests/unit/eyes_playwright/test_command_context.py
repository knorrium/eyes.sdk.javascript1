import os
import sys

import pytest

if sys.version_info < (3, 7) or os.path.exists("/etc/alpine-release"):
    pytest.skip("Tests require playwright support", allow_module_level=True)
else:
    from applitools.playwright.command_context import PlaywrightSpecDriverCommandContext


def test_command_list():
    commands = PlaywrightSpecDriverCommandContext.commands_or_kind()

    assert set(commands) == {
        "executeScript",
        "childContext",
        "findElement",
        "findElements",
        "getCookies",
        "getDriverInfo",
        "getTitle",
        "getUrl",
        "getViewportSize",
        "isDriver",
        "isElement",
        "isSelector",
        "mainContext",
        "setViewportSize",
        "takeScreenshot",
    }
