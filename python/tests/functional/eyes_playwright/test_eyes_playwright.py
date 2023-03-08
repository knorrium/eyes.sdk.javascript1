import pytest
from playwright.sync_api import sync_playwright

from applitools.playwright import Eyes


@pytest.fixture
def page():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        yield browser.new_page()


@pytest.fixture
def eyes(request, page):
    eyes = Eyes()
    eyes.configure.set_viewport_size({"width": 800, "height": 600})
    eyes.configure.set_app_name("eyes-playwright functional tests")
    eyes.configure.set_test_name(request.node.name)
    eyes.open(page)
    yield eyes
    eyes.close()


def test_playwright_eyes_check_fully(eyes, page):
    page.goto("https://demo.applitools.com")
    eyes.check_window()


def test_playwright_eyes_check_non_fully(eyes, page):
    page.goto("https://demo.applitools.com")
    eyes.check_window(fully=False)


def test_playwright_eyes_check_element_selector(eyes, page):
    page.goto("https://demo.applitools.com")
    eyes.check_element("form")


def test_playwright_eyes_check_element_locator(eyes, page):
    page.goto("https://demo.applitools.com")
    element = page.locator("form")
    eyes.check_element(element)
