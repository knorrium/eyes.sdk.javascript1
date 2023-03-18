from __future__ import print_function

import uuid
from os import environ, path, remove
from subprocess import check_call, check_output
from sys import platform

import pytest
from six import PY2

# Generate APPLITOOLS_BATCH_ID for xdist run in case it was not provided externally
environ["APPLITOOLS_BATCH_ID"] = environ.get("APPLITOOLS_BATCH_ID", str(uuid.uuid4()))
# Keep batch open after runner termination
environ["APPLITOOLS_DONT_CLOSE_BATCHES"] = "true"


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session, exitstatus):
    if "TEST_REPORT_SANDBOX" in environ:
        npx = "npx.cmd" if platform == "win32" else "npx"
        sandbox = environ["TEST_REPORT_SANDBOX"].lower() not in ("false", "0")
        if environ.get("RELEASING_PACKAGE") == "eyes_robotframework":
            reported_name = "robotframework"
        else:  # unless releasing robotframework package, report all tests as python sdk
            reported_name = "python"
        git_sha = check_output(["git", "log", "-n1", "--format=%H"]).decode().strip()
        cmd = [npx, "bongo", "report", "--name", reported_name, "--reportId", git_sha]
        if path.exists("coverage-tests-metadata.json"):
            cmd += ["--metaDir", "."]
        if sandbox:
            cmd.append("--sandbox")
        flush = {} if PY2 else {"flush": True}
        print("\n\nReporting tests for package:", reported_name, **flush)
        check_call(cmd)
    remove("coverage-test-report.xml")
