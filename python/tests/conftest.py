from __future__ import print_function

import json
import re
import uuid
from contextlib import closing
from gzip import GzipFile
from itertools import cycle
from os import environ, path, remove
from xml.etree import ElementTree

import pytest
from six.moves.urllib.parse import urlencode, urlsplit, urlunsplit
from six.moves.urllib.request import urlopen

# Generate APPLITOOLS_BATCH_ID for xdist run in case it was not provided externally
environ["APPLITOOLS_BATCH_ID"] = environ.get("APPLITOOLS_BATCH_ID", str(uuid.uuid4()))
# Keep batch open after runner termination
environ["APPLITOOLS_DONT_CLOSE_BATCHES"] = "true"


@pytest.hookimpl(tryfirst=True)
def pytest_collection_modifyitems(items):
    limits = {"sauce_mac_vm": 2, "sauce_vm": 2}
    thread_counters = {fixture: iter(cycle(range(n))) for fixture, n in limits.items()}
    for test in items:
        sauce_fixture = set(test.fixturenames) & set(limits.keys())
        if sauce_fixture:
            assert len(sauce_fixture) == 1, "The test shouldn't be both vm and mac_vm"
            sauce_fixture = sauce_fixture.pop()
            test.add_marker(sauce_fixture)
            thread_number = next(thread_counters[sauce_fixture])
            xdist_group = "{}_{}".format(sauce_fixture, thread_number)
            test.add_marker(pytest.mark.xdist_group(xdist_group))


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session, exitstatus):
    if path.exists("meta.json"):  # it's a generated test suite
        xml = ElementTree.parse("report.xml")
        for testcase in xml.findall("testsuite/testcase"):
            name = testcase.get("name")
            # removes 'test_' prefix and @sauce_mac_vm_0 or @sauce_vm_1 suffix
            cleaned_name = re.sub(
                r"^(test_)?(.+?)(@sauce_(mac_)?vm_\d+)?$", r"\2", name
            )
            testcase.set("name", cleaned_name)
        return xml.write("report.xml", encoding="unicode", xml_declaration=True)


@pytest.fixture(scope="session")
def helpers():
    return Helpers.create()


@pytest.fixture(scope="session")
def sauce_mac_vm():
    user, key = environ["SAUCE_USERNAME"], environ["SAUCE_ACCESS_KEY"]
    return "https://{}:{}@ondemand.us-west-1.saucelabs.com/wd/hub".format(user, key)


@pytest.fixture(scope="session")
def sauce_vm():
    user, key = environ["SAUCE_USERNAME"], environ["SAUCE_ACCESS_KEY"]
    return "https://{}:{}@ondemand.us-west-1.saucelabs.com/wd/hub".format(user, key)


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
