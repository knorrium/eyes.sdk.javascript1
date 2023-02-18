import pytest
from mock import call, patch

from applitools.selenium import ClassicRunner, RunnerOptions, VisualGridRunner
from applitools.selenium.__version__ import __version__
from applitools.selenium.command_executor import ManagerType
from applitools.selenium.protocol import SeleniumWebDriver


def test_visual_grid_runner_creation_default():
    get_instance = "applitools.selenium.command_executor.CommandExecutor.get_instance"
    with patch(get_instance) as get_instance:
        VisualGridRunner()

        assert get_instance.mock_calls == [
            call(SeleniumWebDriver, "eyes.selenium.visualgrid.python", __version__),
            call().core_make_manager(ManagerType.UFG, concurrency=5),
        ]


def test_visual_grid_runner_creation_legacy_concurrency():
    get_instance = "applitools.selenium.command_executor.CommandExecutor.get_instance"
    with patch(get_instance) as get_instance:
        VisualGridRunner(2)

        assert get_instance.mock_calls == [
            call(SeleniumWebDriver, "eyes.selenium.visualgrid.python", __version__),
            call().core_make_manager(ManagerType.UFG, legacy_concurrency=10),
        ]


def test_visual_grid_runner_creation_test_concurrency():
    get_instance = "applitools.selenium.command_executor.CommandExecutor.get_instance"
    with patch(get_instance) as get_instance:
        VisualGridRunner(RunnerOptions().test_concurrency(3))

        assert get_instance.mock_calls == [
            call(SeleniumWebDriver, "eyes.selenium.visualgrid.python", __version__),
            call().core_make_manager(ManagerType.UFG, concurrency=3),
        ]


@pytest.mark.skip("Doesn't work with core-universal")
def test_runner_get_server_info():
    server_info = ClassicRunner.get_server_info()

    assert server_info.logs_dir
