from textwrap import dedent

import pytest
import trafaret as t

from applitools.common import AndroidVersion, IosVersion, LayoutBreakpointsOptions
from applitools.selenium import BrowserType, RectangleSize, StitchMode
from EyesLibrary import RobotConfiguration
from EyesLibrary.config_parser import (
    ConfigurationTrafaret,
    SelectedRunner,
    TextToEnumTrafaret,
    UpperTextToEnumTrafaret,
    ViewPortTrafaret,
)
from EyesLibrary.utils import unicode_yaml_load


def test_text_to_enum_trafaret():
    assert BrowserType.CHROME == TextToEnumTrafaret(BrowserType).check("CHROME")
    assert StitchMode.CSS == TextToEnumTrafaret(StitchMode).check("CSS")

    with pytest.raises(t.DataError, match=r"Incorrect value `MissingBrowser`"):
        TextToEnumTrafaret(BrowserType).check("MissingBrowser")


def test_upper_text_to_enum_trafaret():
    assert BrowserType.CHROME == UpperTextToEnumTrafaret(BrowserType).check("CHROmE")
    assert StitchMode.CSS == UpperTextToEnumTrafaret(StitchMode).check("CSs")

    with pytest.raises(t.DataError, match=r"Incorrect value `MissingBrowser`"):
        UpperTextToEnumTrafaret(BrowserType).check("MissingBrowser")


def test_viewport_size_trafaret():
    expected_red = RectangleSize(400, 400)
    res = ViewPortTrafaret().check({"width": 400, "height": 400})
    assert res == expected_red
    res = ViewPortTrafaret().check("[400 400]")
    assert res == expected_red


EXAMPLE_CONFIG_YAML = """
### applitools.yaml 1.0
### START `SHARED SECTION` ###
server_url: "https://eyesapi.applitools.com" #optional
api_key: YOUR_API_KEY  #Could be specified as APPLITOOLS_API_KEY env variable

proxy:
  url: "http://someproxy-url.com"

properties:
  - name: YOUR_PROPERTY_NAME
    value: YOUR_PROPERTY_VALUE

###### START `AVAILABLE DURING `Eyes Open` CALL SECTION` ######
app_name: YOUR_APP_NAME
viewport_size:
  width: 1920
  height: 1080
branch_name: YOUR_BRANCH_NAME
parent_branch_name: YOUR_PARENT_BRANCH_NAME
baseline_branch_name: YOUR_BASELINE_BRANCH_NAME
baseline_env_name: YOUR_BASELINE_ENV_NAME
dont_close_batches: true
save_diffs: false
match_timeout: 600
save_new_tests: true  #optional
save_failed_tests: false  #optional

batch:  #optional
  id: YOUR_BATCH_ID  #optional
  name: YOUR_BATCH_NAME
  batch_sequence_name: YOUR_BATCH_SEQUENCE_NAME  #optional
  properties:    #optional
    - name: YOUR_BATCH_PROPERTY_NAME
      value: YOUR_BATCH_PROPERTY_VALUE

###### END `AVAILABLE DURING `Eyes Open` CALL SECTION` ######


### END `SHARED SECTION` ###

web:
  force_full_page_screenshot: false  #optional
  wait_before_screenshots: 100  #optional
  stitch_mode: CSS   # Scroll | CSS
  hide_scrollbars: true
  hide_caret: true
# ALL SETTINGS FROM `SHARED SECTION` COULD BE PASSED HERE AS WELL

mobile_native:
  is_simulator: false
# ALL SETTINGS FROM `SHARED SECTION` COULD BE PASSED HERE AS WELL


web_ufg:
  runner_options:
    test_concurrency: 5
  visual_grid_options:
    - key: YOUR_VISUAL_GRID_OPTION
      value: YOUR_VISUAL_GRID_OPTION_VALUE
  disable_browser_fetching: false
  enable_cross_origin_rendering: false
  dont_use_cookies: false
  layout_breakpoints: true
  browsers:
    desktop:
      - browser_type: CHROME  # names from BrowserType
        width: 800
        height: 600
    ios:
      - device_name: iPhone_12_Pro  # names from IosDeviceName
        screen_orientation: PORTRAIT  # PORTRAIT | LANDSCAPE
        ios_version: LATEST  # LATEST | ONE_VERSION_BACK
    chrome_emulation:
      - device_name: iPhone_4  # names from DeviceName
        screen_orientation: PORTRAIT  # PORTRAIT | LANDSCAPE

native_mobile_grid:
  devices:
    ios:
      - device_name: iPhone_12_Pro  # names from IosDeviceName
        screen_orientation: PORTRAIT  # PORTRAIT | LANDSCAPE
        ios_version: LATEST  # LATEST | ONE_VERSION_BACK
    android:
      - device_name: Pixel_3_XL  # names from AndroidDeviceName
        screen_orientation: PORTRAIT  # PORTRAIT | LANDSCAPE
        android_version: LATEST  # LATEST | ONE_VERSION_BACK
"""


@pytest.mark.parametrize("config", [EXAMPLE_CONFIG_YAML])
def test_all_values_in_example_config(config):
    ConfigurationTrafaret.scheme.check(unicode_yaml_load(config))


def test_web_config_options():
    web_config = ConfigurationTrafaret(SelectedRunner.web, RobotConfiguration()).check(
        unicode_yaml_load(EXAMPLE_CONFIG_YAML)
    )

    assert web_config.dont_close_batches


def test_native_mobile_grid_config_options():
    web_config = ConfigurationTrafaret(
        SelectedRunner.native_mobile_grid, RobotConfiguration()
    ).check(unicode_yaml_load(EXAMPLE_CONFIG_YAML))

    assert web_config.browsers_info[0].ios_version is IosVersion.LATEST
    assert web_config.browsers_info[1].android_version is AndroidVersion.LATEST


def test_layout_breakpoints_legacy_bool():
    config = dedent(
        """
    web_ufg:
      layout_breakpoints: true
    """
    )

    web_config = ConfigurationTrafaret(
        SelectedRunner.web_ufg, RobotConfiguration()
    ).check(unicode_yaml_load(config))

    assert web_config.layout_breakpoints is True


def test_layout_breakpoints_legacy_list():
    config = dedent(
        """
    web_ufg:
      layout_breakpoints: [1, 2, 3]
    """
    )

    web_config = ConfigurationTrafaret(
        SelectedRunner.web_ufg, RobotConfiguration()
    ).check(unicode_yaml_load(config))

    assert web_config.layout_breakpoints == [1, 2, 3]


def test_layout_breakpoints_list():
    config = dedent(
        """
    web_ufg:
      layout_breakpoints:
        breakpoints: [1, 2, 3]
    """
    )

    web_config = ConfigurationTrafaret(
        SelectedRunner.web_ufg, RobotConfiguration()
    ).check(unicode_yaml_load(config))

    assert web_config.layout_breakpoints.breakpoints == [1, 2, 3]


def test_layout_breakpoints_bool():
    config = dedent(
        """
    web_ufg:
      layout_breakpoints:
        breakpoints: true
    """
    )

    web_config = ConfigurationTrafaret(
        SelectedRunner.web_ufg, RobotConfiguration()
    ).check(unicode_yaml_load(config))

    assert web_config.layout_breakpoints.breakpoints is True


def test_layout_breakpoints_reload():
    config = dedent(
        """
    web_ufg:
      layout_breakpoints:
        breakpoints: true
        reload: true
    """
    )

    web_config = ConfigurationTrafaret(
        SelectedRunner.web_ufg, RobotConfiguration()
    ).check(unicode_yaml_load(config))

    assert web_config.layout_breakpoints == LayoutBreakpointsOptions(True, True)
