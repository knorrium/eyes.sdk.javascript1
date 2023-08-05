import os
import subprocess
import sys
from os import chdir, getcwd, path
from typing import TYPE_CHECKING

import pytest
from robot import run_cli
from robot.result import ExecutionResult

from EyesLibrary.test_results_manager import (
    METADATA_EYES_TEST_RESULTS_URL_NAME,
    METADATA_PATH_TO_EYES_RESULTS_NAME,
)

if TYPE_CHECKING:
    from typing import Generator

    from robot.result import TestCase as RobotTestCase
    from robot.result import TestSuite as RobotTestSuite


def run_robot(*args, output_file_path=None, isolation=True):
    test_dir = path.join(path.dirname(__file__), "robot_tests")
    call_args = (
        "--output={}.xml".format(output_file_path),
        "--report={}.html".format(output_file_path),
        "--log={}-log.html".format(output_file_path),
    ) + args
    if isolation:
        robot = (sys.executable, "-m", "robot")
        subprocess.run(robot + call_args, cwd=test_dir)
    else:
        dir = getcwd()
        chdir(test_dir)
        try:
            run_cli(call_args, exit=False)
        finally:
            chdir(dir)


def from_suite(suite):
    # type: (RobotTestSuite) -> Generator[RobotTestCase]
    if suite.suites:
        for s in suite.suites:
            for t in s.tests:
                yield t
    else:
        for t in suite.tests:
            yield t


@pytest.mark.parametrize("runner", ["web", "web_ufg"])
@pytest.mark.parametrize(
    "with_propagation",
    [
        [
            "--prerebotmodifier",
            "EyesLibrary.PropagateEyesTestResults",
        ],
        [],
    ],
    ids=lambda d: "manual propagate" if d else "auto patched",
)
def test_suite_dir_with_results_propagation_and_one_diff_in_report(
    tmp_path, runner, with_propagation, local_chrome_driver
):
    output_file_path = os.path.join(tmp_path, "testsuite-dir")
    args = with_propagation + [
        "--variable",
        "RUNNER:{}".format(runner),
        "test_suite_dir",
    ]
    run_robot(*args, output_file_path=output_file_path)
    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in from_suite(result.suite) if t.status != "PASS"]
    assert not_passed == [], "\n".join(msg.message for msg in result.errors.messages)
    assert METADATA_PATH_TO_EYES_RESULTS_NAME in result.suite.suites[0].metadata
    assert METADATA_PATH_TO_EYES_RESULTS_NAME in result.suite.suites[1].metadata

    # check that report html is containing 1 failed test
    # need browser here to display js based content
    local_chrome_driver.get("file://" + output_file_path + ".html")
    assert METADATA_EYES_TEST_RESULTS_URL_NAME in local_chrome_driver.page_source
    assert "1 test failed" in local_chrome_driver.page_source


def test_web_mobile_android(sauce_vm, tmp_path):
    output_file_path = os.path.join(tmp_path, "web-appium-android")
    run_robot(
        "--variablefile",
        "variables_test.py:web:appium:android",
        "web_only.robot",
        output_file_path=output_file_path,
    )
    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in result.suite.tests if t.status != "PASS"]
    assert not_passed == [], "\n".join(msg.message for msg in result.errors.messages)


def test_web_mobile_ios(sauce_mac_vm, tmp_path):
    output_file_path = os.path.join(tmp_path, "web-appium-ios")
    run_robot(
        "--variablefile",
        "variables_test.py:web:appium:ios",
        "web_only.robot",
        output_file_path=output_file_path,
    )
    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in result.suite.tests if t.status != "PASS"]
    assert not_passed == [], "\n".join(msg.message for msg in result.errors.messages)


@pytest.mark.parametrize(
    "data",
    [
        ("web_ufg", "selenium", "desktop"),
        ("web", "selenium", "desktop"),
    ],
    ids=lambda d: str(d),
)
def test_web_desktop(data, tmp_path):
    runner, backend, platform = data
    output_file_path = os.path.join(
        tmp_path, "{}-{}-{}".format(runner, backend, platform)
    )
    run_robot(
        "--variablefile",
        "variables_test.py:{runner}:{backend}:{platform}".format(
            runner=runner, backend=backend, platform=platform
        ),
        "web_desktop_only.robot",
        "web_only.robot",
        output_file_path=output_file_path,
    )
    result = ExecutionResult(output_file_path + ".xml")

    not_passed = [t for t in from_suite(result.suite) if t.status != "PASS"]
    assert not_passed == [], "\n".join(msg.message for msg in result.errors.messages)


def test_suite_mobile_native_android(sauce_vm, tmp_path):
    output_file_path = os.path.join(tmp_path, "mobile_native-appium-android")
    run_robot(
        "--variablefile",
        "variables_test.py:mobile_native:appium:android",
        "mobile_native.robot",
        output_file_path=output_file_path,
    )

    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in result.suite.tests if t.status != "PASS"]
    assert not_passed == [], "\n".join(msg.message for msg in result.errors.messages)


def test_suite_mobile_native_ios(sauce_mac_vm, tmp_path):
    output_file_path = os.path.join(tmp_path, "mobile_native-appium-ios")
    run_robot(
        "--variablefile",
        "variables_test.py:mobile_native:appium:ios",
        "mobile_native.robot",
        output_file_path=output_file_path,
    )

    result = ExecutionResult(output_file_path + ".xml")
    not_passed = [t for t in result.suite.tests if t.status != "PASS"]
    assert not_passed == [], "\n".join(msg.message for msg in result.errors.messages)


def test_execution_cloud(tmp_path):
    output_file_path = os.path.join(tmp_path, "web_ec")
    run_robot("web_ec.robot", output_file_path=output_file_path, isolation=False)

    result = ExecutionResult(output_file_path + ".xml")
    assert [t.status for t in result.suite.tests] == ["PASS"], str(result.errors)
