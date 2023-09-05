from applitools.common import (
    ChromeEmulationInfo,
    DesktopBrowserInfo,
    DeviceName,
    EnvironmentInfo,
    IosDeviceInfo,
    IosDeviceName,
    IosVersion,
    RectangleSize,
    ScreenOrientation,
    schema,
)
from applitools.common.schema import demarshal_error


def test_demarshal_browser_info():
    deserializer = schema.BrowserInfo(allow_none=True)
    assert DesktopBrowserInfo(800, 600, "chrome") == deserializer.deserialize(
        {"width": 800, "height": 600, "name": "chrome"}
    )
    assert DesktopBrowserInfo(
        800, 600, "chrome-one-version-back"
    ) == deserializer.deserialize(
        {"width": 800, "height": 600, "name": "chrome-one-version-back"}
    )
    assert IosDeviceInfo(IosDeviceName.iPhone_12) == deserializer.deserialize(
        {
            "iosDeviceInfo": {
                "deviceName": "iPhone 12",
                "screenOrientation": "portrait",
            }
        }
    )
    assert IosDeviceInfo(
        IosDeviceName.iPhone_12, ScreenOrientation.PORTRAIT, IosVersion.ONE_VERSION_BACK
    ) == deserializer.deserialize(
        {
            "iosDeviceInfo": {
                "deviceName": "iPhone 12",
                "screenOrientation": "portrait",
                "version": "latest-1",
            }
        }
    )
    assert ChromeEmulationInfo(DeviceName.Galaxy_S10) == deserializer.deserialize(
        {
            "chromeEmulationInfo": {
                "deviceName": "Galaxy S10",
                "screenOrientation": "portrait",
            }
        }
    )

    assert deserializer.deserialize(
        {
            "environment": {
                "renderEnvironmentId": "renderer-id",
                "renderer": {
                    "iosDeviceInfo": {
                        "deviceName": "iPhone SE (3rd generation)",
                        "version": "15.0",
                    }
                },
                "deviceName": "iPhone SE (3rd generation)",
                "os": "iOS 15.0",
                "viewportSize": {"width": 375, "height": 667},
            }
        }
    ) == EnvironmentInfo(
        render_environment_id="renderer-id",
        os="iOS 15.0",
        device_name="iPhone SE (3rd generation)",
        viewport_size=RectangleSize(375, 667),
        renderer={
            "iosDeviceInfo": {
                "deviceName": "iPhone SE (3rd generation)",
                "version": "15.0",
            }
        },
    )


def test_demarshal_usdk_error():
    exc = demarshal_error(
        {
            "message": "Message.",
            "stack": "Error: Message.\n  stack trace line 1\n  stack trace line 2",
        }
    )
    assert str(exc) == "Message.\n  stack trace line 1\n  stack trace line 2"


def test_demarshal_usdk_empty_error():
    exc = demarshal_error(
        {
            "message": "",
            "reason": "internal",
            "stack": "TestError\n    stack trace line 1",
        }
    )
    assert str(exc) == "\nTestError\n    stack trace line 1"
