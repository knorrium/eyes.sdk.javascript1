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
