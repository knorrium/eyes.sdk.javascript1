from playwright.sync_api import sync_playwright

from applitools.selenium import Eyes
from applitools.selenium.runner import PlaywrightRunner


def test_playwright_eyes_check_non_fully():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://whatsmyuseragent.org/")
        runner = PlaywrightRunner()
        eyes = Eyes(runner)
        eyes.configure.set_viewport_size({"width": 800, "height": 600})
        eyes.open(page, "Playwright", "Eyes check non-fully")
        eyes.check_window(fully=False)
        eyes.close()


def test_playwright_eyes_check_fully():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://whatsmyuseragent.org/")
        runner = PlaywrightRunner()
        eyes = Eyes(runner)
        eyes.configure.set_viewport_size({"width": 800, "height": 600})
        eyes.open(page, "Playwright", "Eyes check fully")
        eyes.check_window()
        eyes.close()


def test_playwright_eyes_check_element_selector():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://whatsmyuseragent.org/")
        runner = PlaywrightRunner()
        eyes = Eyes(runner)
        eyes.configure.set_viewport_size({"width": 800, "height": 600})
        eyes.open(page, "Playwright", "Eyes check element selector")
        eyes.check_element(".user-agent")
        eyes.close()


def test_playwright_eyes_check_element_locator():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://whatsmyuseragent.org/")
        element = page.locator(".ip-address")
        runner = PlaywrightRunner()
        eyes = Eyes(runner)
        eyes.configure.set_viewport_size({"width": 800, "height": 600})
        eyes.open(page, "Playwright", "Eyes check element locator")
        eyes.check_element(element)
        eyes.close()
