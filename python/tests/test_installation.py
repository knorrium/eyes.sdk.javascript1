import os.path
import re
import sys
from subprocess import call
from subprocess import check_output as run

import pytest

from applitools.common import __version__ as common_version
from applitools.core_universal import __version__ as core_universal_version
from applitools.images import __version__ as eyes_images_version
from applitools.selenium import __version__ as eyes_selenium_version
from EyesLibrary.__version__ import __version__ as eyes_robotframework_version

here = os.path.dirname(__file__)
root_dir = os.path.normpath(os.path.join(here, os.pardir))

env = dict(os.environ)
env.pop("PYTHONPATH", None)
no_playwright = sys.version_info < (3, 7) or os.path.exists("/etc/alpine-release")


def _get_venv_package_license(venv, package):
    # strip all non-ascii charters to avoid console encoding error on windows
    cmd = [
        venv.python,
        "-c",
        "from pkg_resources import get_distribution;"
        "from sys import version_info;"
        "py2 = version_info < (3,);"
        'license = get_distribution("{package}").get_metadata("LICENSE");'
        'license = license.decode("utf-8") if py2 else license;'
        'print(license.encode("ascii", "ignore"))'.format(package=package),
    ]
    return run(cmd, env=env).decode("ascii")


def _get_venv_packages(venv):
    output = run([venv.python, "-m", "pip", "freeze"], env=env).decode("ascii")
    pairs = [re.split("==| @ ", line) for line in output.splitlines()]
    return dict(pairs)


@pytest.fixture
def core_universal_installed(venv):
    call([venv.python, "-m", "pip", "uninstall", "-y", "wheel"], env=env)
    wheels = os.path.join(root_dir, "core_universal", "dist")
    pip = [venv.python, "-m", "pip", "install", "--no-index", "--find-links", wheels]
    run(pip + ["core_universal==" + core_universal_version], env=env)


@pytest.fixture
def eyes_common_installed(venv, core_universal_installed):
    file_name = "eyes_common-{}-py2.py3-none-any.whl".format(common_version)
    eyes_common = os.path.join(root_dir, "eyes_common", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    run(pip + [eyes_common], env=env)


@pytest.fixture
def eyes_images_installed(venv, eyes_common_installed):
    file_name = "eyes_images-{}-py2.py3-none-any.whl".format(eyes_images_version)
    eyes_images = os.path.join(root_dir, "eyes_images", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    run(pip + [eyes_images], env=env)


@pytest.fixture
def eyes_selenium_installed(venv, eyes_common_installed):
    file_name = "eyes_selenium-{}-py2.py3-none-any.whl".format(eyes_selenium_version)
    eyes_selenium = os.path.join(root_dir, "eyes_selenium", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    run(pip + [eyes_selenium], env=env)


@pytest.fixture
def eyes_playwright_installed(venv, eyes_common_installed):
    file_name = "eyes_playwright-{}-py3-none-any.whl".format(eyes_selenium_version)
    eyes_selenium = os.path.join(root_dir, "eyes_playwright", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    run(pip + [eyes_selenium], env=env)


@pytest.fixture
def eyes_robotframework_installed(venv, eyes_selenium_installed):
    file_name = "eyes_robotframework-{}-py2.py3-none-any.whl".format(
        eyes_robotframework_version
    )
    eyes_robot = os.path.join(root_dir, "eyes_robotframework", "dist", file_name)
    pip = [venv.python, "-m", "pip", "install"]
    run(pip + [eyes_robot], env=env)


def test_setup_core_universal(venv, core_universal_installed):
    assert str(venv.get_version("core-universal")) == core_universal_version
    get_version = [venv.python, "-m", "applitools.core_universal", "--version"]
    # drop post-version part, that might only be present in package version
    binary_version = ".".join(core_universal_version.split(".")[:3])
    assert binary_version.encode() == run(get_version, env=env).rstrip()
    all_packages = _get_venv_packages(venv)
    assert set(all_packages.keys()) == {"core-universal"}


def test_core_universal_has_license(venv, core_universal_installed):
    license = _get_venv_package_license(venv, "core-universal")
    assert "SDK LICENSE AGREEMENT" in license


def test_setup_eyes_images(venv, eyes_images_installed):
    assert str(venv.get_version("eyes-images")) == eyes_images_version
    run([venv.python, "-c", "from applitools.images import *"], env=env)
    all_packages = _get_venv_packages(venv)
    assert "selenium" not in all_packages
    assert "Appium-Python-Client" not in all_packages


def test_eyes_images_has_license(venv, eyes_images_installed):
    license = _get_venv_package_license(venv, "eyes-images")
    assert "SDK LICENSE AGREEMENT" in license


def test_setup_eyes_selenium(venv, eyes_selenium_installed):
    assert str(venv.get_version("eyes-selenium")) == eyes_selenium_version
    run([venv.python, "-c", "from applitools.selenium import *"], env=env)

    all_packages = _get_venv_packages(venv)
    assert "selenium" in all_packages
    assert "Appium-Python-Client" in all_packages


def test_eyes_selenium_has_license(venv, eyes_selenium_installed):
    license = _get_venv_package_license(venv, "eyes-selenium")
    assert "SDK LICENSE AGREEMENT" in license


@pytest.mark.skipif(no_playwright, reason="Playwright is not supported here")
def test_eyes_playwright_has_license(venv, eyes_playwright_installed):
    license = _get_venv_package_license(venv, "eyes-playwright")
    assert "SDK LICENSE AGREEMENT" in license


def test_setup_eyes_robot(venv, eyes_robotframework_installed):
    assert str(venv.get_version("eyes-robotframework")) == eyes_robotframework_version
    run([venv.python, "-c", "from EyesLibrary import *"], env=env)


def test_eyes_robotframework_has_license(venv, eyes_robotframework_installed):
    license = _get_venv_package_license(venv, "eyes-robotframework")
    assert "SDK LICENSE AGREEMENT" in license
