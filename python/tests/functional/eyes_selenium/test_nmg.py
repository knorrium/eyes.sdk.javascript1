import pytest
from appium.webdriver import Remote

from applitools.common import IosDeviceInfo, IosDeviceName, ScreenOrientation
from applitools.common.ultrafastgrid import (
    AndroidDeviceInfo,
    AndroidDeviceName,
    AndroidVersion,
)
from applitools.selenium import Eyes, VisualGridRunner


@pytest.mark.sauce
@pytest.mark.filterwarnings("ignore:desired_capabilities has been deprecated")
def test_nmg_ios_basic(sauce_driver_url):
    caps = {
        "app": "storage:filename=awesomeswift.app.zip",
        "deviceName": "iPhone 12 Pro Simulator",
        "platformName": "iOS",
        "platformVersion": "15.2",
    }
    Eyes.set_nmg_capabilities(caps)
    with Remote(sauce_driver_url, caps) as driver:
        runner = VisualGridRunner()
        eyes = Eyes(runner)
        eyes.configure.add_mobile_device(
            IosDeviceInfo(IosDeviceName.iPhone_12, ScreenOrientation.PORTRAIT)
        )
        eyes.open(driver, "USDK Test", "UFG native iOS basic test")
        eyes.check_window()
        eyes.close()

        all_results = runner.get_all_test_results()

        assert all_results.passed == 1


@pytest.mark.sauce
def test_nmg_android_basic(sauce_driver_url):
    caps = {
        "app": "storage:filename=android_nmg.apk",
        "appium:autoGrantPermissions": True,
        "deviceName": "Android GoogleAPI Emulator",
        "platformName": "Android",
        "platformVersion": "11.0",
    }
    Eyes.set_nmg_capabilities(caps)
    with Remote(sauce_driver_url, caps) as driver:
        runner = VisualGridRunner()
        eyes = Eyes(runner)
        eyes.configure.add_mobile_device(
            AndroidDeviceInfo(
                AndroidDeviceName.Pixel_4_XL, android_version=AndroidVersion.LATEST
            )
        )
        eyes.open(driver, "USDK Test", "UFG native Android basic test")
        eyes.check_window()
        eyes.close()

        all_results = runner.get_all_test_results()

        assert all_results.passed == 1
