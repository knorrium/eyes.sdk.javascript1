from __future__ import absolute_import, division, print_function

from applitools.common.fluent.web_target import WebTarget

from .selenium_check_settings import SeleniumCheckSettings

__all__ = ("Target",)


class Target(WebTarget):
    CheckSettings = SeleniumCheckSettings
