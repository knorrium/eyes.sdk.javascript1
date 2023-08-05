import os

import pytest
from appium.webdriver import Remote


@pytest.fixture
def pixel_3_xl(app, sauce_vm, browser_name, orientation, sauce_test_name):
    capabilities = {
        "automationName": "UIAutomator2",
        "deviceName": "Google Pixel 3 XL GoogleAPI Emulator",
        "deviceOrientation": orientation.upper(),
        "name": sauce_test_name,
        "platformName": "Android",
        "platformVersion": "10.0",
    }
    return appium(capabilities, sauce_vm, app=app, browser_name=browser_name)


@pytest.fixture
def pixel_3a_xl(app, sauce_vm, browser_name, orientation, sauce_test_name):
    capabilities = {
        "automationName": "UIAutomator2",
        "deviceName": "Google Pixel 3a XL GoogleAPI Emulator",
        "deviceOrientation": orientation.upper(),
        "name": sauce_test_name,
        "platformName": "Android",
        "platformVersion": "10.0",
    }
    return appium(capabilities, sauce_vm, app=app, browser_name=browser_name)


@pytest.fixture
def samsung_galaxy_s8(app, sauce_vm, browser_name, orientation, sauce_test_name):
    capabilities = {
        "appium:automationName": "UIAutomator2",
        "appium:deviceName": "Samsung Galaxy S8 FHD GoogleAPI Emulator",
        "appium:platformVersion": "7.0",
        "sauce:options": {
            "deviceOrientation": orientation.upper(),
            "name": sauce_test_name,
        },
        "platformName": "Android",
    }
    return appium(capabilities, sauce_vm, app=app, browser_name=browser_name)


@pytest.fixture
def iphone_xs(app, sauce_mac_vm, browser_name, orientation, sauce_test_name):
    capabilities = {
        "deviceName": "iPhone XS Simulator",
        "deviceOrientation": orientation.upper(),
        "idleTimeout": 180,
        "name": sauce_test_name,
        "platformName": "iOS",
        "platformVersion": "13.0",
    }
    return appium(capabilities, sauce_mac_vm, app=app, browser_name=browser_name)


@pytest.fixture(scope="function")
def iphone_12(app, sauce_mac_vm, browser_name, orientation, sauce_test_name):
    capabilities = {
        "deviceName": "iPhone 12 Pro Simulator",
        "deviceOrientation": orientation.upper(),
        "idleTimeout": 180,
        "name": sauce_test_name,
        "platformName": "iOS",
        "platformVersion": "15.2",
    }
    return appium(capabilities, sauce_mac_vm, app=app, browser_name=browser_name)


def appium(desired_caps, sauce_url, app=None, browser_name=None):
    if app and browser_name:
        raise Exception("Appium drivers shouldn't contain both app and browserName")
    if not app and not browser_name:
        raise Exception("Appium drivers should have app or browserName")
    if app:
        desired_caps["app"] = app
    if browser_name:
        desired_caps["browserName"] = browser_name

    selenium_url = os.getenv("SELENIUM_SERVER_URL", sauce_url)
    return Remote(command_executor=selenium_url, desired_capabilities=desired_caps)
