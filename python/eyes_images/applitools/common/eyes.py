from __future__ import absolute_import, division, print_function, unicode_literals

from typing import TYPE_CHECKING, List, Optional, Text, Tuple, Union, overload

from six import string_types

from ..common.command_executor import CommandExecutor
from ..common.schema import (
    demarshal_locate_result,
    demarshal_match_result,
    demarshal_test_results,
)
from . import EyesError, FailureReports, RectangleSize, TestFailedError, deprecated
from .__version__ import __version__
from .config import Configuration
from .fluent.check_settings import CheckSettings
from .fluent.web_target import WebTarget
from .runner import EyesRunner, log_session_results_and_raise_exception

if TYPE_CHECKING:
    from typing import TypeVar

    from . import MatchResult, Region, TestResults
    from .extract_text import PATTERN_TEXT_REGIONS, OCRRegion, TextRegionSettings
    from .locators import LOCATORS_TYPE, VisualLocatorSettings
    from .optional_deps import (
        ElementHandle,
        Page,
        PlaywrightLocator,
        WebDriver,
        WebElement,
    )
    from .utils.custom_types import FrameReference, ViewPort

    Self = TypeVar("Self", bound="EyesBase")  # typedef


class EyesBase(object):
    _Configuration = Configuration
    _DefaultRunner = EyesRunner

    def __init__(self, runner):
        # type: (Optional[Self._DefaultRunner]) -> None
        self._eyes_ref = None
        self._object_registry = None
        self.configuration = self._Configuration()
        self._runner = runner or self._DefaultRunner()
        self._commands = self._runner._commands  # noqa

    @property
    def configure(self):
        # type: () -> Self._Configuration
        return self.configuration

    @configure.setter
    def configure(self, value):
        self.configuration = value

    def get_configuration(self):
        # type:() -> Self._Configuration
        return self.configuration.clone()

    def set_configuration(self, configuration):
        # type:(Self._Configuration) -> None
        self.configuration = configuration.clone()

    @property
    def is_open(self):
        # type: () -> bool
        return self._eyes_ref is not None

    @property
    def base_agent_id(self):
        # type: () -> Text
        """
        Must return version of SDK. (e.g. selenium, visualgrid) in next format:
            "eyes.{package}.python/{lib_version}"
        """
        return "{}/{}".format(self._runner.BASE_AGENT_ID, __version__)

    @property
    def full_agent_id(self):
        # type: () -> Text
        """
        Gets the agent id, which identifies the current library using the SDK.

        """
        if self.configuration.agent_id is None:
            return self.base_agent_id
        else:
            return "{} [{}]".format(self.configuration.agent_id, self.base_agent_id)

    def _prepare_open(
        self,
        app_name=None,  # type: Optional[Text]
        test_name=None,  # type: Optional[Text]
        viewport_size=None,  # type: Optional[ViewPort]
    ):
        # type: (...) -> None
        if app_name is not None:
            self.configuration.app_name = app_name
        if test_name is not None:
            self.configuration.test_name = test_name
        if viewport_size is not None:
            self.configuration.viewport_size = viewport_size
        if self.configuration.app_name is None:
            raise ValueError("app_name should be set via configuration or an argument")
        if self.configuration.test_name is None:
            raise ValueError("test_name should be set via configuration or an argument")

        self._runner._set_connection_config(self.configuration)  # noqa, friend
        self._object_registry = self._runner.Protocol.object_registry()

    def _close(self, raise_ex, wait_result):
        # type: (bool, bool) -> Optional[TestResults]
        if self.configuration.is_disabled:
            return None
        if not self.is_open:
            raise EyesError("Eyes not open")
        self._commands.eyes_close(
            self._object_registry, self._eyes_ref, raise_ex, self.configuration
        )
        if wait_result:
            results = self._commands.eyes_get_results(self._eyes_ref, raise_ex)
        else:
            results = None
        self._eyes_ref = None
        self._object_registry = None
        if results is not None:
            results = demarshal_test_results(results, self.configuration)
            if results:  # eyes are already aborted by closed runner
                for r in results:
                    log_session_results_and_raise_exception(raise_ex, r)
                return results[0]  # Original interface returns just one result
        return None

    def _abort(self, wait_result):
        # type: (bool) -> Optional[TestResults]
        if self.configuration.is_disabled:
            return None
        elif self.is_open:
            self._commands.eyes_abort(self._object_registry, self._eyes_ref)
            if wait_result:
                results = self._commands.eyes_get_results(self._eyes_ref, False)
            else:
                results = None
            self._eyes_ref = None
            self._object_registry = None
            if results is not None:
                if results:  # abort after close does not return results
                    results = demarshal_test_results(results, self.configuration)
                    for r in results:
                        log_session_results_and_raise_exception(False, r)
                    return results[0]  # Original interface returns just one result
            return None

    def __getattr__(self, item):
        return getattr(self.configuration, item)

    def __setattr__(self, key, value):
        if "configuration" in vars(self) and (
            key in vars(self.configuration)
            or key in ("match_level", "ignore_displacements")
        ):
            return setattr(self.configuration, key, value)
        else:
            return super(EyesBase, self).__setattr__(key, value)


class WebEyes(EyesBase):
    Target = WebTarget

    def __init__(self, runner=None):
        # type: (Union[None, EyesRunner, Text]) -> None
        if isinstance(runner, string_types):
            server_url = runner
            runner = None
        else:
            server_url = None
        super(WebEyes, self).__init__(runner)
        self.driver = None
        if server_url:
            self.configuration.set_server_url(server_url)

    def open(
        self,
        driver,  # type: Union[WebDriver, Page]
        app_name=None,  # type: Optional[Text]
        test_name=None,  # type: Optional[Text]
        viewport_size=None,  # type: Optional[ViewPort]
    ):
        # type: (...) -> Union[WebDriver, Page]
        if not self.configuration.is_disabled:
            self._prepare_open(app_name, test_name, viewport_size)
            self.driver = driver
            self._eyes_ref = self._commands.manager_open_eyes(
                self._object_registry,
                self._runner._ref,  # noqa
                driver,
                config=self.configuration,
            )
        return driver

    @overload
    def check(self, name, check_settings):
        # type: (Text, CheckSettings) -> MatchResult
        """
        Takes a snapshot and matches it with the expected output.

        :param name: The name of the tag.
        :param check_settings: target which area of the window to check.
        """
        pass

    @overload
    def check(self, check_settings):
        # type: (CheckSettings) -> None
        """
        Takes a snapshot and matches it with the expected output.

        :param check_settings: target which area of the window to check.
        """
        pass

    def check(self, check_settings, name=None):
        # type: (CheckSettings, Optional[Text]) -> Optional[MatchResult]
        if isinstance(name, CheckSettings) or isinstance(check_settings, string_types):
            check_settings, name = name, check_settings
        if check_settings is None:
            check_settings = self.Target.window()
        if name:
            check_settings = check_settings.with_name(name)

        if self.configuration.is_disabled:
            return None
        if not self.is_open:
            self.abort()
            raise EyesError("you must call open() before checking")

        results = self._commands.eyes_check(
            self._object_registry,
            self._eyes_ref,
            None,
            check_settings,
            self.configuration,
        )
        if results:
            # Original API only returns one result
            results = demarshal_match_result(results[0])
            if (
                not results.as_expected
                and self.configuration.failure_reports is FailureReports.IMMEDIATE
            ):
                raise TestFailedError(
                    "Mismatch found in '{}' of '{}'".format(
                        self.configuration.test_name, self.configuration.app_name
                    )
                )
            else:
                return results
        else:
            return None

    def locate(self, visual_locator_settings):
        # type: (VisualLocatorSettings) -> LOCATORS_TYPE
        results = self._commands.core_locate(
            self.driver,
            visual_locator_settings,
            self.configuration,
        )
        return demarshal_locate_result(results)

    def extract_text(self, *regions):
        # type: (*OCRRegion) -> List[Text]
        return self._commands.core_extract_text(
            self.driver,
            regions,
            self.configuration,
        )

    def locate_text(self, config):
        # type: (TextRegionSettings) -> PATTERN_TEXT_REGIONS
        return self.extract_text_regions(config)

    def extract_text_regions(self, config):
        # type: (TextRegionSettings) -> PATTERN_TEXT_REGIONS
        return self._commands.core_locate_text(self.driver, config, self.configuration)

    def close(self, raise_ex=True):
        # type: (bool) -> Optional[TestResults]
        """
        Ends the test.

        :param raise_ex: If true, an exception will be raised for failed/new tests.
        :return: The test results.
        """
        self.driver = None
        return self._close(raise_ex, True)

    def close_async(self):
        # type: () -> Optional[TestResults]
        self.driver = None
        return self._close(False, False)

    def abort(self):
        # type: () -> Optional[TestResults]
        """
        If a test is running, aborts it. Otherwise, does nothing.
        """
        self.driver = None
        return self._abort(True)

    def abort_async(self):
        self.driver = None
        return self._abort(False)

    @deprecated.attribute("use `abort()` instead")
    def abort_if_not_closed(self):
        return self.abort()

    @classmethod
    def get_viewport_size(cls, driver):
        # type: (Union[WebDriver, Page]) -> RectangleSize
        cmd = CommandExecutor.get_instance(
            cls._DefaultRunner.Protocol, cls._DefaultRunner.BASE_AGENT_ID, __version__
        )
        result = cmd.core_get_viewport_size(driver)
        return RectangleSize.from_(result)

    @classmethod
    def set_viewport_size(cls, driver, viewport_size):
        # type: (Union[WebDriver, Page], ViewPort) -> None
        cmd = CommandExecutor.get_instance(
            cls._DefaultRunner.Protocol, cls._DefaultRunner.BASE_AGENT_ID, __version__
        )
        cmd.core_set_viewport_size(driver, viewport_size)

    def check_window(self, tag=None, match_timeout=-1, fully=None):
        # type: (Optional[Text], int, Optional[bool]) -> MatchResult
        """
        Takes a snapshot of the application under test and matches it with the expected
         output.

        :param tag: An optional tag to be associated with the snapshot.
        :param match_timeout:  The amount of time to retry matching (milliseconds)
        :param fully: Defines that the screenshot will contain the entire window.
        """
        return self.check(tag, self.Target.window().timeout(match_timeout).fully(fully))

    def check_frame(self, frame_reference, tag=None, match_timeout=-1):
        # type: (FrameReference, Optional[Text], int) -> MatchResult
        """
        Check frame.

        :param frame_reference: The name or id of the frame to check. (The same
                name/id as would be used in a call to driver.switch_to.frame()).
        :param tag: An optional tag to be associated with the match.
        :param match_timeout: The amount of time to retry matching. (Milliseconds)
        """
        return self.check(
            tag, self.Target.frame(frame_reference).fully().timeout(match_timeout)
        )

    def check_region(
        self,
        region,  # type: Union[Region, Text, List, Tuple, WebElement]
        tag=None,  # type: Optional[Text]
        match_timeout=-1,  # type: int
        stitch_content=False,  # type: bool
    ):
        # type: (...) -> MatchResult
        """
        Takes a snapshot of the given region from the browser using the web driver
        and matches it with the expected output. If the current context is a frame,
        the region is offsetted relative to the frame.

        :param region: The region which will be visually validated. The coordinates are
                       relative to the viewport of the current frame.
        :param tag: Description of the visual validation checkpoint.
        :param match_timeout: Timeout for the visual validation checkpoint
                              (milliseconds).
        :param stitch_content: If `True`, stitch the internal content of the region
        """
        return self.check(
            tag,
            self.Target.region(region).timeout(match_timeout).fully(stitch_content),
        )

    def check_element(
        self,
        element,
        # type: Union[Text,List,Tuple,WebElement,PlaywrightLocator,ElementHandle]
        tag=None,  # type: Optional[Text]
        match_timeout=-1,  # type: int
    ):
        # type: (...) -> MatchResult
        """
        Takes a snapshot of the given region from the browser using the web driver
        and matches it with the expected output. If the current context is a frame,
        the region is offsetted relative to the frame.

        :param element: The element to check.
        :param tag: Description of the visual validation checkpoint.
        :param match_timeout: Timeout for the visual validation checkpoint
                              (milliseconds).
        """
        return self.check(
            tag,
            self.Target.region(element).timeout(match_timeout).fully(),
        )

    def check_region_in_frame(
        self,
        frame_reference,  # type: FrameReference
        region,
        # type: Union[Region,Text,List,Tuple,WebElement,PlaywrightLocator,ElementHandle]
        tag=None,  # type: Optional[Text]
        match_timeout=-1,  # type: int
        stitch_content=False,  # type: bool
    ):
        # type: (...) -> MatchResult
        """
        Checks a region within a frame, and returns to the current frame.

        :param frame_reference: A reference to the frame in which the region
                                should be checked.
        :param region: Specifying the region to check inside the frame.
        :param tag: Description of the visual validation checkpoint.
        :param match_timeout: Timeout for the visual validation checkpoint
                              (milliseconds).
        :param stitch_content: If `True`, stitch the internal content of the region
        """
        return self.check(
            tag,
            self.Target.region(region)
            .frame(frame_reference)
            .stitch_content(stitch_content)
            .timeout(match_timeout),
        )

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.driver = None
        if exc_type:
            self._abort(self._runner.AUTO_CLOSE_MODE_SYNC)
        else:
            self._close(True, self._runner.AUTO_CLOSE_MODE_SYNC)
