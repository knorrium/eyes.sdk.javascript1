import sys

import selenium
from pytest import fixture
from selenium.common.exceptions import WebDriverException

from applitools.selenium import BatchInfo, ClassicRunner, Eyes, StitchMode

from .devices import *
from .sauce import pytest_collection_modifyitems, sauce_url

batch_info = BatchInfo(
    "Py{}.{}|Sel{} Generated tests".format(*sys.version_info[:2], selenium.__version__)
)


@fixture
def name_of_test(request):
    return "Python {}".format(request.node.name)


@fixture
def legacy():
    return False


@fixture
def driver_builder(chrome):
    return chrome


@fixture
def driver(driver_builder):
    yield driver_builder
    driver_builder.quit()


@fixture
def stitch_mode():
    return StitchMode.Scroll


@fixture
def emulation():
    is_emulation = False
    orientation = ""
    page = ""
    return is_emulation, orientation, page


@fixture
def eyes_runner_class():
    return ClassicRunner()


@fixture
def eyes(eyes_runner_class, stitch_mode, emulation):
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
    is_emulation, orientation, page = emulation
    if is_emulation:
        eyes.add_property("Orientation", orientation)
        eyes.add_property("Page", page)
    yield eyes
    # If the test was aborted before eyes.close was called, ends the test as aborted.
    eyes.abort()
