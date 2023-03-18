import sys
from os import path

from playwright.sync_api import sync_playwright
from pytest import fixture

from applitools.playwright import BatchInfo, Eyes, StitchMode

# allows generates tests to import 'test' module
sys.path.insert(0, path.abspath((path.dirname(__file__))))

batch_info = BatchInfo("Py{}.{} pw Generated tests".format(*sys.version_info[:2]))


@fixture(scope="session")
def playwright():
    with sync_playwright() as p:
        yield p


@fixture(scope="session")
def pw_chrome(playwright):
    browser = playwright.chromium
    with browser.launch(ignore_default_args=["--hide-scrollbars"], headless=True) as b:
        yield b


@fixture(scope="session")
def pw_firefox(playwright):
    browser = playwright.firefox
    with browser.launch(ignore_default_args=["--hide-scrollbars"], headless=True) as b:
        yield b


@fixture
def page(pw_browser):
    with pw_browser.new_context() as context:
        yield context.new_page()


@fixture
def stitch_mode():
    return StitchMode.Scroll


@fixture
def eyes(eyes_runner_class, stitch_mode):
    """
    Basic Eyes setup. It'll abort test if wasn't closed properly.
    """
    eyes = Eyes(eyes_runner_class)
    eyes.configure.batch = batch_info
    eyes.configure.branch_name = "master"
    eyes.configure.parent_branch_name = "master"
    eyes.configure.set_stitch_mode(stitch_mode)
    eyes.configure.set_save_new_tests(False)
    eyes.configure.set_hide_caret(True)
    eyes.configure.set_hide_scrollbars(True)
    yield eyes
    # If the test was aborted before eyes.close was called, ends the test as aborted.
    eyes.abort()
