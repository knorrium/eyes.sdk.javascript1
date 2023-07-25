from __future__ import absolute_import


def _version(package_name):
    try:  # assume python>=3.9
        from importlib.metadata import version

        return version(package_name)
    except ImportError:  # older python
        from pkg_resources import get_distribution

        return get_distribution(package_name).version


__version__ = _version("core-universal")


def get_instance():
    from . import instance

    return instance.instance


__all__ = ("get_instance",)
