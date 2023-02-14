import time

import pytest
from selenium.webdriver.common.by import By

from applitools.selenium import Target


def test_directly_set_viewport_size(eyes, local_chrome_driver):
    required_viewport = {"width": 800, "height": 600}
    eyes.set_viewport_size(local_chrome_driver, required_viewport)
    assert required_viewport == eyes.get_viewport_size(local_chrome_driver)


@pytest.mark.test_page_url("data:text/html,<p>Test</p>")
def test_abort_eyes(eyes, local_chrome_driver):
    eyes.open(
        local_chrome_driver, "Test Abort", "Test Abort", {"width": 1200, "height": 800}
    )
    time.sleep(15)
    eyes.abort()


def test_capture_element_on_pre_scrolled_down_page(eyes, local_chrome_driver):
    local_chrome_driver.get(
        "http://applitools.github.io/demo/TestPages/FramesTestPage/longframe.html"
    )
    eyes.open(
        driver=local_chrome_driver,
        app_name="Applitools Eyes SDK",
        test_name="Test capture element on pre scrolled down page",
        viewport_size={"width": 800, "height": 600},
    )
    local_chrome_driver.execute_script("window.scrollTo(0, 300)")
    eyes.check("Row 10", Target.region("body > table > tr:nth-child(10)"))
    eyes.check("Row 20", Target.region("body > table > tr:nth-child(20)"))
    eyes.close()
