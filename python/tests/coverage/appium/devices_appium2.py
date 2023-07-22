import os

import pytest
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions
from appium.webdriver import Remote

from . import sauce


@sauce.vm
@pytest.fixture(scope="function")
def pixel_3_xl(app, sauce_url, browser_name, orientation):
    options = UiAutomator2Options()
    options.device_name = "Google Pixel 3 XL GoogleAPI Emulator"
    options.orientation = orientation.upper()
    options.set_capability("platformVersion", "10.0")
    return appium(options, sauce_url, app=app, browser_name=browser_name)


@sauce.vm
@pytest.fixture(scope="function")
def pixel_3a_xl(app, sauce_url, browser_name, orientation):
    options = UiAutomator2Options()
    options.device_name = "Google Pixel 3a XL GoogleAPI Emulator"
    options.orientation = orientation.upper()
    options.set_capability("platformVersion", "10.0")
    return appium(options, sauce_url, app=app, browser_name=browser_name)


@sauce.vm
@pytest.fixture(scope="function")
def samsung_galaxy_s8(app, sauce_url, browser_name, orientation):
    options = UiAutomator2Options()
    options.device_name = "Samsung Galaxy S8 FHD GoogleAPI Emulator"
    options.set_capability("platformVersion", "7.0")
    options.orientation = orientation.upper()
    return appium(options, sauce_url, app=app, browser_name=browser_name)


@sauce.mac_vm
@pytest.fixture(scope="function")
def iphone_xs(app, sauce_url, browser_name, orientation):
    options = XCUITestOptions()
    options.device_name = "iPhone XS Simulator"
    options.orientation = orientation.upper()
    options.set_capability("platformVersion", "13.0")
    return appium(options, sauce_url, app=app, browser_name=browser_name)


@sauce.mac_vm
@pytest.fixture(scope="function")
def iphone_12(app, sauce_url, browser_name, orientation):
    options = XCUITestOptions()
    options.device_name = "iPhone 12 Pro Simulator"
    options.orientation = orientation.upper()
    options.set_capability("platformVersion", "15.2")
    return appium(options, sauce_url, app=app, browser_name=browser_name)


def appium(options, sauce_url, app="", browser_name=""):
    if app and browser_name:
        raise Exception("Appium drivers shouldn't contain both app and browserName")
    if not app and not browser_name:
        raise Exception("Appium drivers should have app or browserName")
    if app:
        options.app = app
    if browser_name:
        options.set_capability("browserName", browser_name)

    selenium_url = os.getenv("SELENIUM_SERVER_URL", sauce_url)
    return Remote(command_executor=selenium_url, options=options)
