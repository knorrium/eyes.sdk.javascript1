import os
import subprocess
import sys

import pytest
from robot.result import ExecutionResult

from EyesLibrary.test_results_manager import METADATA_EYES_TEST_RESULTS_URL_NAME


def robot(suite, *args, isolation=True):
    if isolation:
        robot = (sys.executable, "-m", "robot")
        return subprocess.run(robot + args, cwd=suite).returncode
    else:
        from robot import run_cli

        dir = os.getcwd()
        os.chdir(suite)
        try:
            # should explicitly pass outputdir, robot caches cwd during import
            return run_cli(("--outputdir", suite) + args, exit=False)
        finally:
            os.chdir(dir)


def pabot(suite, *args, isolation=True):
    if isolation:
        pabot = (sys.executable, "-m", "pabot.pabot")
        return subprocess.run(pabot + args, cwd=suite).returncode
    else:
        from pabot.pabot import main_program

        dir = os.getcwd()
        os.chdir(suite)
        try:
            # should explicitly pass outputdir, robot caches cwd during import
            return main_program(("--outputdir", suite) + args)
        finally:
            os.chdir(dir)


@pytest.mark.parametrize("tool", [robot, pabot])
def test_execution_cloud(robot_suite, tool):
    rc = tool(robot_suite, "execution_cloud.robot")
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 0
    assert result.statistics.total.passed == 1
    assert rc == 0


def test_mobile_native__android(robot_suite_maker, sauce_vm):
    vars = get_variables("mobile_native", "appium", "android")
    robot_suite = robot_suite_maker.make(**vars)
    rc = robot(robot_suite, ".", isolation=False)
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 0
    assert result.statistics.total.passed == 1
    assert rc == 0


@pytest.mark.skip("Mobile app is missing")
def test_mobile_native__ios(robot_suite_maker, sauce_mac_vm):
    vars = get_variables("mobile_native", "appium", "ios")
    robot_suite = robot_suite_maker.make(**vars)
    rc = robot(robot_suite, ".", isolation=False)
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 0
    assert result.statistics.total.passed == 1
    assert rc == 0


@pytest.mark.templates("web_desktop_only", "web_only", "resources/setup")
@pytest.mark.parametrize("runner_type", ("web_ufg", "web"))
def test_web_desktop(robot_suite_maker, runner_type):
    vars = get_variables(runner_type, "selenium", "desktop")
    robot_suite = robot_suite_maker.make(**vars)
    rc = robot(robot_suite, ".")
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 0
    assert result.statistics.total.passed == 9
    assert rc == 0


@pytest.mark.templates("web_only", "resources/setup")
def test_web_only__ios(sauce_mac_vm, robot_suite_maker):
    vars = get_variables("web", "appium", "ios")
    robot_suite = robot_suite_maker.make(**vars)
    rc = robot(robot_suite, ".")
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 0
    assert result.statistics.total.passed == 3
    assert rc == 0


@pytest.mark.templates("web_only", "resources/setup")
def test_web_only__android(sauce_vm, robot_suite_maker):
    vars = get_variables("web", "appium", "android")
    robot_suite = robot_suite_maker.make(**vars)
    rc = robot(robot_suite, ".")
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 0
    assert result.statistics.total.passed == 3
    assert rc == 0


@pytest.mark.templates("suite1", "suite2", "suite3")
@pytest.mark.parametrize("runner_type", ["web", "web_ufg"])
@pytest.mark.parametrize("propagation", ["manual", "auto"])
@pytest.mark.parametrize("tool", [robot, pabot])
def test_suite_dir_with_results_propagation_and_one_diff_in_report(
    robot_suite, runner_type, propagation, tool, local_chrome_driver
):
    if propagation == "manual":
        args = ["--prerebotmodifier", "EyesLibrary.PropagateEyesTestResults"]
    else:
        args = []
    args.extend(["--variable", "RUNNER:" + runner_type, "."])
    rc = tool(robot_suite, *args)
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == 1
    assert result.statistics.total.passed == 3
    assert rc == (0 if tool is robot else 1)

    # check that report html is containing 1 failed test
    # need browser here to display js based content
    local_chrome_driver.get("file://" + str(robot_suite / "report.html"))
    status = local_chrome_driver.find_element(
        "css selector", "body > table > tbody > tr:nth-child(1) > td"
    )
    assert status.text == "1 test failed"
    assert METADATA_EYES_TEST_RESULTS_URL_NAME in local_chrome_driver.page_source


@pytest.mark.templates("suite2")
@pytest.mark.parametrize("tool", [robot, pabot])
@pytest.mark.parametrize("switch,exp_fail,exp_pass", [["on", 1, 1], ["off", 0, 2]])
def test_results_propagation_switch(
    robot_suite_maker, tool, local_chrome_driver, switch, exp_fail, exp_pass
):
    config = {"propagate_eyes_test_results": switch == "on"}
    robot_suite = robot_suite_maker.make(config=config)
    tool(robot_suite, "--variable", "RUNNER:web_ufg", ".")
    result = ExecutionResult(robot_suite / "output.xml")

    assert result.statistics.total.failed == exp_fail
    assert result.statistics.total.passed == exp_pass


def from_suite(suite):
    # type: (RobotTestSuite) -> Generator[RobotTestCase]
    if suite.suites:
        for s in suite.suites:
            for t in s.tests:
                yield t
    else:
        for t in suite.tests:
            yield t


def get_variables(
    runner_type,  # Literal["web", "web_ufg", "mobile_native"]
    backend_library,  # Literal["appium", "selenium"]
    platform,  # Literal["ios", "android", "desktop"]
):
    batch_name = "RobotFramework"

    if platform == "android":
        batch_name += " | Android"
        desired_caps = {
            "platformName": "Android",
            "platformVersion": "11.0",
            "deviceName": "Android GoogleAPI Emulator",
            "deviceOrientation": "portrait",
        }
    elif platform == "ios":
        batch_name += " | IOS"
        desired_caps = {
            "platformName": "iOS",
            "platformVersion": "15.4",
            "deviceName": "iPhone 13 Simulator",
            "deviceOrientation": "portrait",
        }
    else:
        desired_caps = {}  # What?

    if backend_library == "appium":
        backend_library_name = "AppiumLibrary"

        if runner_type in ["mobile_native"]:
            batch_name += " | App"
            if platform == "android":
                desired_caps.update(
                    {
                        "automationName": "UiAutomator2",
                        "app": "storage:filename=SimpleRandomStock_nmg.apk",
                        "clearSystemFiles": True,
                        "noReset": True,
                        "appium:autoGrantPermissions": True,
                    }
                )
            elif platform == "ios":
                desired_caps.update(
                    {
                        "app": "storage:filename=awesomeswift_nmg.app.zip",
                        "clearSystemFiles": True,
                        "noReset": True,
                        "automationName": "XCUITest",
                    }
                )
        else:
            batch_name += " | Web"
            if platform == "desktop":
                batch_name += " | Desktop"
    elif backend_library == "selenium":
        batch_name += " | Web"
        backend_library_name = "SeleniumLibrary"

    else:
        raise ValueError("Invalid backend library", backend_library)

    if runner_type == "web":
        if platform == "android":
            desired_caps.update(
                {
                    "browserName": "Chrome",
                }
            )
        elif platform == "ios":
            desired_caps.update({"browserName": "Safari"})
    elif runner_type == "web_ufg":
        batch_name += " | UFG"

    return {
        "BATCH_NAME": batch_name,
        "RUNNER": runner_type,
        "BACKEND_LIBRARY_NAME": backend_library_name,
        "DESIRED_CAPS": desired_caps,
    }
