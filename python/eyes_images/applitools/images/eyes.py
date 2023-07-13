from __future__ import absolute_import, division, print_function

from typing import TYPE_CHECKING, ByteString, Union, overload

from six import string_types

from applitools.common import FailureReports, Region, TestFailedError
from applitools.common.eyes import EyesBase
from applitools.common.schema import (
    demarshal_locate_text_result,
    demarshal_match_result,
)
from applitools.common.selenium import Configuration
from applitools.common.target import ImageTarget

from .extract_text import OCRRegion, TextRegionSettings
from .fluent import Image, ImagesCheckSettings, Target
from .runner import ClassicRunner

if TYPE_CHECKING:
    from typing import List, Optional, Text

    from applitools.common import TestResults
    from applitools.common.extract_text import PATTERN_TEXT_REGIONS
    from applitools.common.utils.custom_types import ViewPort


class Eyes(EyesBase):
    _Configuration = Configuration
    _DefaultRunner = ClassicRunner

    def __init__(self):
        super(Eyes, self).__init__(None)

    def open(self, app_name=None, test_name=None, dimension=None):
        # type: (Text, Text, Optional[ViewPort]) -> None
        if not self.configure.is_disabled:
            self._prepare_open(app_name, test_name, dimension)
            self._eyes_ref = self._commands.manager_open_eyes(
                self._object_registry,
                self._runner._ref,  # noqa
                config=self.configure,
            )

    @overload
    def check(self, name, check_settings):
        # type: (Text, ImagesCheckSettings) -> bool
        pass

    @overload
    def check(self, check_settings):
        # type: (ImagesCheckSettings) -> bool
        pass

    def check(self, check_settings, name=None):
        # type: (ImagesCheckSettings, Optional[Text]) -> bool
        if isinstance(name, ImagesCheckSettings) or isinstance(
            check_settings, string_types
        ):
            check_settings, name = name, check_settings
        if name:
            check_settings = check_settings.with_name(name)

        results = self._commands.eyes_check(
            self._object_registry,
            self._eyes_ref,
            ImageTarget(check_settings.values.image, check_settings.values.dom),
            check_settings,
            self.configuration,
        )
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
            return results.as_expected

    def check_image(self, image, tag=None):
        # type: (Union[ByteString, Text, Image], Optional[Text]) -> bool
        return self.check(tag, Target.image(image))

    def check_region(self, image, region, tag=None):
        # type: (Union[ByteString, Text, Image], Region, Optional[Text]) -> bool
        return self.check(tag, Target.region(image, region))

    def extract_text(self, *regions):
        # type: (*OCRRegion) -> List[Text]
        image = regions[0].image
        assert all(r.image == image for r in regions), "All images same"
        return self._commands.core_extract_text(
            ImageTarget(image),
            regions,
            self.configuration,
        )

    def locate_text(self, config):
        # type: (TextRegionSettings) -> PATTERN_TEXT_REGIONS
        return self.extract_text_regions(config)

    def extract_text_regions(self, config):
        # type: (TextRegionSettings) -> PATTERN_TEXT_REGIONS
        result = self._commands.core_locate_text(
            ImageTarget(config._image),  # noqa
            config,
            self.configuration,
        )
        return demarshal_locate_text_result(result)

    def close(self, raise_ex=True):
        # type: (bool) -> Optional[TestResults]
        """
        Ends the test.

        :param raise_ex: If true, an exception will be raised for failed/new tests.
        :return: The test results.
        """
        return self._close(raise_ex, True)

    def abort(self):
        # type: () -> Optional[TestResults]
        return self._abort(True)
