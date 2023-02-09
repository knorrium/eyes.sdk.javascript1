from __future__ import absolute_import

import logging
from enum import Enum
from os import getcwd
from threading import Lock
from typing import TYPE_CHECKING, Any, List, Optional, Text

from ..common import TestResults
from ..common.errors import USDKFailure
from ..common.target import ImageTarget
from .connection import USDKConnection
from .schema import (
    demarshal_error,
    marshal_check_settings,
    marshal_configuration,
    marshal_delete_test_settings,
    marshal_ec_client_settings,
    marshal_enabled_batch_close,
    marshal_image_target,
    marshal_locate_settings,
    marshal_ocr_extract_settings,
    marshal_ocr_search_settings,
    marshal_viewport_size,
    marshal_webdriver_ref,
)

if TYPE_CHECKING:
    from typing import Tuple, Union

    from ..common.selenium import Configuration
    from ..common.utils.custom_types import ViewPort
    from ..core import TextRegionSettings, VisualLocatorSettings
    from ..core.batch_close import _EnabledBatchClose  # noqa
    from ..core.ec_client_settings import ECClientSettings
    from ..core.extract_text import OCRRegion
    from .fluent import SeleniumCheckSettings
    from .optional_deps import WebDriver

logger = logging.getLogger(__name__)

Failure = USDKFailure  # backward compatibility with eyes-selenium==5.0.0


class ManagerType(Enum):
    UFG = "ufg"
    CLASSIC = "classic"


class CommandExecutor(object):
    @classmethod
    def create(cls, name, version):
        # type: (Text, Text) -> CommandExecutor
        commands = cls(USDKConnection.create())
        commands.make_core(name, version, getcwd())
        return commands

    @classmethod
    def get_instance(cls, name, version):
        # type: (Text, Text) -> CommandExecutor
        with _instances_lock:
            key = (name, version)
            if key in _instances:
                return _instances[key]
            else:
                return _instances.setdefault(key, cls.create(name, version))

    def __init__(self, connection):
        # type: (USDKConnection) -> None
        self._connection = connection

    def make_core(self, name, version, cwd):
        # type: (Text, Text, Text) -> None
        self._connection.notification(
            "Core.makeCore",
            {"name": name, "version": version, "cwd": cwd, "protocol": "webdriver"},
        )

    def core_make_ec_client(self, ec_client_settings):
        # type: (ECClientSettings) -> Text
        settings = marshal_ec_client_settings(ec_client_settings)
        return self._checked_command("Core.makeECClient", {"settings": settings})

    def core_make_manager(
        self, manager_type, concurrency=None, legacy_concurrency=None, agent_id=None
    ):
        # type: (ManagerType, Optional[int], Optional[int], Optional[Text]) -> dict
        payload = {"type": manager_type.value}
        if concurrency is not None:
            payload["concurrency"] = concurrency
        if legacy_concurrency is not None:
            payload["legacyConcurrency"] = legacy_concurrency
        if agent_id is not None:
            payload["agentId"] = agent_id
        return self._checked_command("Core.makeManager", payload)

    def core_get_viewport_size(self, driver):
        # type: (WebDriver) -> dict
        target = marshal_webdriver_ref(driver)
        return self._checked_command("Core.getViewportSize", {"target": target})

    def core_set_viewport_size(self, driver, size):
        # type: (WebDriver, ViewPort) -> None
        target = marshal_webdriver_ref(driver)
        self._checked_command(
            "Core.setViewportSize",
            {"target": target, "size": marshal_viewport_size(size)},
        )

    def core_close_batch(self, close_batch_settings):
        # type: (_EnabledBatchClose) -> None
        settings = []
        for batch_id in close_batch_settings._ids:  # noqa
            close_batch_settings.batch_id = batch_id
            settings.append(marshal_enabled_batch_close(close_batch_settings))
        self._checked_command("Core.closeBatch", {"settings": settings})

    def core_delete_test(self, test_results):
        # type: (TestResults) -> None
        settings = marshal_delete_test_settings(test_results)
        self._checked_command("Core.deleteTest", {"settings": settings})

    def manager_open_eyes(self, manager, target=None, config=None):
        # type: (dict, Optional[WebDriver], Optional[Configuration]) -> dict
        payload = {"manager": manager}
        if target is not None:
            payload["target"] = marshal_webdriver_ref(target)
        if config is not None:
            payload["config"] = marshal_configuration(config)
        return self._checked_command("EyesManager.openEyes", payload)

    def manager_get_results(self, manager, raise_ex, timeout):
        # type: (dict, bool, float) -> List[dict]
        return self._checked_command(
            "EyesManager.getResults",
            {"manager": manager, "settings": {"throwErr": raise_ex}},
            wait_timeout=timeout,
        )

    def eyes_check(
        self,
        eyes,  # type: dict
        target,  # type: Union[WebDriver, ImageTarget]
        settings,  # type: SeleniumCheckSettings
        config,  # type: Configuration
    ):
        # type: (...) -> dict
        payload = {
            "eyes": eyes,
            "settings": marshal_check_settings(settings),
            "config": marshal_configuration(config),
        }
        if isinstance(target, ImageTarget):
            payload["target"] = marshal_image_target(target)
        else:
            payload["target"] = marshal_webdriver_ref(target)
        return self._checked_command("Eyes.check", payload)

    def core_locate(self, target, settings, config):
        # type: (WebDriver, VisualLocatorSettings, Configuration) -> dict
        payload = {
            "target": marshal_webdriver_ref(target),
            "settings": marshal_locate_settings(settings),
            "config": marshal_configuration(config),
        }
        return self._checked_command("Core.locate", payload)

    def core_extract_text(
        self,
        target,  # type: Union[WebDriver, ImageTarget]
        settings,  # type: Tuple[OCRRegion]
        config,  # type: Configuration
    ):
        # type: (...) -> List[Text]
        payload = {
            "settings": marshal_ocr_extract_settings(settings),
            "config": marshal_configuration(config),
        }
        if isinstance(target, ImageTarget):
            payload["target"] = marshal_image_target(target)
        else:
            payload["target"] = marshal_webdriver_ref(target)
        return self._checked_command("Core.extractText", payload)

    def core_locate_text(
        self,
        target,  # type: Union[WebDriver, ImageTarget]
        settings,  # type: TextRegionSettings
        config,  # type: Configuration
    ):
        # type: (...) -> dict
        payload = {
            "settings": marshal_ocr_search_settings(settings),
            "config": marshal_configuration(config),
        }
        if isinstance(target, ImageTarget):
            payload["target"] = marshal_image_target(target)
        else:
            payload["target"] = marshal_webdriver_ref(target)
        return self._checked_command("Core.locateText", payload)

    def eyes_close(self, eyes, throw_err, config):
        # type: (dict, bool, Configuration) -> List[dict]
        payload = {
            "eyes": eyes,
            "settings": {"throwErr": throw_err},
            "config": marshal_configuration(config),
        }
        return self._checked_command("Eyes.close", payload)

    def eyes_get_results(self, eyes, throw_err):
        payload = {
            "eyes": eyes,
            "settings": {"throwErr": throw_err},
        }
        return self._checked_command("Eyes.getResults", payload)

    def eyes_abort(self, eyes):
        # type: (dict) -> List[dict]
        return self._checked_command("Eyes.abort", {"eyes": eyes})

    def server_get_info(self):
        # type: () -> dict
        return self._checked_command("Server.getInfo", {})

    def _checked_command(self, name, payload, wait_result=True, wait_timeout=9 * 60):
        # type: (Text, dict, bool, float) -> Optional[Any]
        response = self._connection.command(name, payload, wait_result, wait_timeout)
        if wait_result:
            response_payload = response["payload"]
            _check_error(response_payload)
            return response_payload.get("result")
        else:
            return None


def _check_error(payload):
    # type: (dict) -> None
    error = payload.get("error")
    if error:
        usdk_error = demarshal_error(error)
        logger.error("Re-raising an error received from SDK server: %r", usdk_error)
        raise usdk_error


_instances = {}
_instances_lock = Lock()
