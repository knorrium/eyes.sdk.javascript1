from __future__ import print_function

import json
import re
import uuid
from contextlib import closing
from gzip import GzipFile
from os import environ, getcwd, path, remove
from subprocess import check_call, check_output
from sys import platform
from typing import Optional, Tuple
from xml.etree import ElementTree

import pytest
from six import PY2
from six.moves.urllib.parse import urlencode, urlsplit, urlunsplit
from six.moves.urllib.request import urlopen

# Generate APPLITOOLS_BATCH_ID for xdist run in case it was not provided externally
environ["APPLITOOLS_BATCH_ID"] = environ.get("APPLITOOLS_BATCH_ID", str(uuid.uuid4()))
# Keep batch open after runner termination
environ["APPLITOOLS_DONT_CLOSE_BATCHES"] = "true"


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session, exitstatus):
    try:
        from selenium import __version__ as selenium_version
    except ImportError:
        selenium_version = "4"
    is_generic = path.exists("meta.json")
    if is_generic:
        remove_test_name_prefix("coverage-test-report.xml")
    if environ.get("BONGO_REPORT_TESTS", "false").lower() not in ("false", "0"):
        releasing_package = environ.get("RELEASING_PACKAGE")
        npx = "npx.cmd" if platform == "win32" else "npx"
        git_sha = check_output(["git", "log", "-n1", "--format=%H"]).decode().strip()
        suite_dir = path.basename(getcwd())
        selenium_version = int(selenium_version.split(".", 1)[0])
        reported_name, group = sdk_name_group(
            is_generic, selenium_version, suite_dir, releasing_package
        )
        cmd = [npx, "bongo", "report", "--verbose"]
        cmd += ["--reportId", reported_name + "_" + git_sha, "--name", reported_name]
        if is_generic:
            cmd += ["--metaDir", "."]
        if not releasing_package:
            cmd.append("--sandbox")
        flush = {} if PY2 else {"flush": True}
        print("\n\nReporting tests:", " ".join(cmd), **flush)
        check_call(cmd)
    if environ.get("CI", "false").lower() not in ("true", "1"):
        remove("coverage-test-report.xml")


@pytest.fixture(scope="session")
def helpers():
    return Helpers.create()


class Helpers(object):
    @classmethod
    def create(cls):
        return cls(environ["APPLITOOLS_API_KEY"])

    def __init__(self, api_key):
        self.api_key = api_key

    def get_test_info(self, results):
        url = "{}?format=json&AccessToken={}&apiKey={}".format(
            results.api_urls.session, results.secret_token, self.api_key
        )
        with closing(urlopen(url)) as response:
            return json.load(response)

    def get_dom(self, results, dom_id):
        api_key = environ["APPLITOOLS_API_KEY_READ"]
        app_session_url = urlsplit(results.app_urls.session)
        url = urlunsplit(
            app_session_url._replace(
                path="/api/images/dom/" + dom_id + "/",
                query=app_session_url.query
                + "&"
                + urlencode({"apiKey": api_key, "format": "json"}),
            )
        )
        with closing(urlopen(url)) as response:
            return json.load(GzipFile(fileobj=response))

    @classmethod
    def get_nodes_by_attribute(cls, node, attribute):
        nodes = [node] if attribute in node.get("attributes", {}) else []
        for child_node in node.get("childNodes", []):
            nodes.extend(cls.get_nodes_by_attribute(child_node, attribute))
        return nodes


def remove_test_name_prefix(xml_report_path):
    """Remove test_ prefix from test names in junit xml report."""
    xml = ElementTree.parse(xml_report_path)
    for testcase in xml.findall("testsuite/testcase"):
        name = testcase.get("name")
        # removes 'test_' prefix and @sauce_mac_0 or @sauce_vm_1 suffix
        cleaned_name = re.sub(r"^(test_)?(.+?)(@sauce_(mac_)?vm_\d+)?$", r"\2", name)
        testcase.set("name", cleaned_name)
    return xml.write(xml_report_path, encoding="unicode", xml_declaration=True)


def sdk_name_group(is_generic, selenium_version, suite_dir, releasing_package):
    # type: (bool, int, str, Optional[str]) -> Tuple[str, Optional[str]]
    group_name = "images" if is_generic and suite_dir == "images" else None
    if releasing_package == "eyes_robotframework":
        default_sdk_name = "robotframework"
    else:
        default_sdk_name = "python"

    if is_generic:
        sdk_name_map = {
            "appium": {3: "python_selenium_3", 4: default_sdk_name},
            "selenium": {3: "python_selenium_3", 4: default_sdk_name},
            "playwright": {4: "python_playwright"},
            "images": {3: default_sdk_name, 4: default_sdk_name},
        }
        sdk_name = sdk_name_map[suite_dir][selenium_version]
        return sdk_name, group_name
    else:
        return default_sdk_name, group_name


def test_sdk_name_group():
    # releaseing eyes_selenium
    assert sdk_name_group(True, 4, "images", "eyes_selenium") == ("python", "images")
    assert sdk_name_group(True, 3, "appium", "eyes_selenium") == (
        "python_selenium_3",
        None,
    )
    assert sdk_name_group(True, 4, "appium", "eyes_selenium") == ("python", None)
    assert sdk_name_group(True, 3, "selenium", "eyes_selenium") == (
        "python_selenium_3",
        None,
    )
    assert sdk_name_group(True, 4, "selenium", "eyes_selenium") == ("python", None)
    assert sdk_name_group(True, 4, "playwright", "eyes_selenium") == (
        "python_playwright",
        None,
    )

    # releasing eyes_robotframework
    assert sdk_name_group(True, 4, "images", "eyes_robotframework") == (
        "robotframework",
        "images",
    )
    assert sdk_name_group(True, 3, "appium", "eyes_robotframework") == (
        "python_selenium_3",
        None,
    )
    assert sdk_name_group(True, 4, "appium", "eyes_robotframework") == (
        "robotframework",
        None,
    )
    assert sdk_name_group(True, 3, "selenium", "eyes_robotframework") == (
        "python_selenium_3",
        None,
    )
    assert sdk_name_group(True, 4, "selenium", "eyes_robotframework") == (
        "robotframework",
        None,
    )
    assert sdk_name_group(True, 4, "playwright", "eyes_robotframework") == (
        "python_playwright",
        None,
    )

    # non-generic tests always reported to python/robotframework
    assert sdk_name_group(False, 4, "any", None) == ("python", None)
    assert sdk_name_group(False, 4, "any", "eyes_selenium") == ("python", None)
    assert sdk_name_group(False, 4, "any", "eyes_robotframework") == (
        "robotframework",
        None,
    )
