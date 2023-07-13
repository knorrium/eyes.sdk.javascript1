from __future__ import absolute_import, division, print_function

from typing import TYPE_CHECKING

from applitools.common.object_registry import ObjectRegistry

if TYPE_CHECKING:
    from selenium.webdriver.remote.webdriver import WebDriver
    from selenium.webdriver.remote.webelement import WebElement


class SeleniumWebdriverObjectRegistry(ObjectRegistry):
    def marshal_driver(self, driver):
        # type: (WebDriver) -> dict
        return {
            "sessionId": driver.session_id,
            "serverUrl": driver.command_executor._url,
            "capabilities": driver.capabilities,
        }

    def marshal_element(self, element):
        # type: (WebElement) -> dict
        return {"elementId": element._id}
