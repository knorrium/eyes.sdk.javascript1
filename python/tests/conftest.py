from __future__ import print_function

import json
import re
import uuid
from contextlib import closing
from gzip import GzipFile
from os import environ, path, remove
from subprocess import check_call, check_output
from sys import platform
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
    if environ.get("BONGO_REPORT_TESTS", "false").lower() not in ("false", "0"):
        releasing_package = environ.get("RELEASING_PACKAGE")
        npx = "npx.cmd" if platform == "win32" else "npx"
        if releasing_package == "eyes_robotframework":
            reported_name = "robotframework"
        else:  # unless releasing robotframework package, report all tests as python sdk
            reported_name = "python"
        git_sha = check_output(["git", "log", "-n1", "--format=%H"]).decode().strip()
        cmd = [npx, "bongo", "report", "--name", reported_name, "--reportId", git_sha]
        if path.exists("coverage-tests-metadata.json"):
            remove_test_name_prefix("coverage-test-report.xml")
            cmd += ["--metaDir", "."]
        if not releasing_package:
            cmd.append("--sandbox")
        flush = {} if PY2 else {"flush": True}
        print("\n\nReporting tests for package:", reported_name, **flush)
        check_call(cmd)
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
