import sys

import pytest
import selenium
from selenium import webdriver
from webdriver_manager.firefox import GeckoDriverManager

from applitools.selenium import VisualGridRunner

LEGACY_SELENIUM = int(selenium.__version__.split(".")[0]) < 4
# Download driver during module import to avoid racy downloads by xdist workers
GECKO_DRIVER = GeckoDriverManager().install()


@pytest.fixture
def chrome(eyes_runner_class, request):
    if "RegionByElementWithinShadowDomWithVg" in request.node.name and LEGACY_SELENIUM:
        pytest.skip("This test can not be run with chrome 96+ and old Selenium")
    options = webdriver.ChromeOptions()
    if sys.platform == "darwin":
        options.binary_location = (
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        )
    options.add_argument("--headless")
    if isinstance(eyes_runner_class, VisualGridRunner):
        options.capabilities.pop("platform", None)
        options.capabilities.pop("version", None)
        from applitools.selenium import Eyes

        url = Eyes.get_execution_cloud_url()
        return webdriver.Remote(command_executor=url, options=options)
    else:
        return webdriver.Chrome(options=options)


@pytest.fixture
def firefox():
    options = webdriver.FirefoxOptions()
    options.add_argument("-headless")
    if LEGACY_SELENIUM:
        return webdriver.Firefox(executable_path=GECKO_DRIVER, options=options)
    else:
        from selenium.webdriver.firefox.service import Service

        return webdriver.Firefox(service=Service(GECKO_DRIVER), options=options)


@pytest.fixture
def ie_11(sauce_vm, sauce_test_name):
    options = webdriver.IeOptions()
    options.set_capability("browserVersion", "11.285")
    options.set_capability("platformName", "Windows 10")
    options.set_capability("sauce:options", {"name": sauce_test_name})
    return webdriver.Remote(command_executor=sauce_vm, options=options)


@pytest.fixture
def edge_18(sauce_vm, sauce_test_name):
    if LEGACY_SELENIUM:
        capabilities = {
            "browserName": "MicrosoftEdge",
            "browserVersion": "18.17763",
            "platformName": "Windows 10",
            "sauce:options": {"screenResolution": "1920x1080", "name": sauce_test_name},
        }
        return webdriver.Remote(sauce_vm, capabilities)
    else:
        options = webdriver.EdgeOptions()
        options.browser_version = "18.17763"
        options.platform_name = "Windows 10"
        options.set_capability(
            "sauce:options", {"screenResolution": "1920x1080", "name": sauce_test_name}
        )
        return webdriver.Remote(command_executor=sauce_vm, options=options)


@pytest.fixture
def safari_11(sauce_mac_vm, sauce_test_name):
    if LEGACY_SELENIUM:
        capabilities = {
            "browserName": "safari",
            "name": sauce_test_name,
            "platform": "macOS 10.13",
            "version": "11.1",
        }
        return webdriver.Remote(sauce_mac_vm, capabilities)
    else:
        pytest.skip("Safari 11 can only be accessed in legacy Selenium 3")


@pytest.fixture
def safari_12(sauce_mac_vm, sauce_test_name):
    if LEGACY_SELENIUM:
        capabilities = {
            "browserName": "safari",
            "name": sauce_test_name,
            "platform": "macOS 10.13",
            "seleniumVersion": "3.4.0",
            "version": "12.1",
        }
        return webdriver.Remote(sauce_mac_vm, capabilities)
    else:
        pytest.skip("Safari 12 can only be accessed in legacy Selenium 3")


@pytest.fixture
def chrome_emulator():
    def make_emulated_driver(name, args):
        assert name == "Android 8.0"
        options = webdriver.ChromeOptions()
        mobile_emulation = {
            "deviceMetrics": {"width": 384, "height": 512, "pixelRatio": 2.0},
            "userAgent": "Mozilla/5.0 (Linux; Android 8.0.0; "
            "Android SDK built for x86_64 Build/OSR1.180418.004) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/69.0.3497.100 Mobile "
            "Safari/537.36",
        }
        options.add_experimental_option("mobileEmulation", mobile_emulation)
        options.add_argument("--headless")
        for arg in args or ():
            options.add_argument(arg)
        return webdriver.Chrome(options=options)

    return make_emulated_driver
