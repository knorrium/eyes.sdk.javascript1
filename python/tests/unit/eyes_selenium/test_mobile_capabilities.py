import pytest

from applitools.common import EyesError, ProxySettings
from applitools.selenium import Eyes

LIBRARY_PATH = (
    "@executable_path/Frameworks/Applitools_iOS.xcframework/"
    "ios-arm64_x86_64-simulator/Applitools_iOS.framework/Applitools_iOS:"
    "@executable_path/Frameworks/Applitools_iOS.xcframework/"
    "ios-arm64/Applitools_iOS.framework/Applitools_iOS"
)


def test_mobile_capabilities_explicit():
    caps = {"capsKey": "capsValue"}
    Eyes.set_mobile_capabilities(caps, "abc", "https://server", "http://proxy:1234")

    assert caps == {
        "capsKey": "capsValue",
        "optionalIntentArguments": '--es APPLITOOLS \'{"APPLITOOLS_API_KEY": "abc", '
        '"APPLITOOLS_PROXY_URL": "http://proxy:1234", '
        '"APPLITOOLS_SERVER_URL": "https://server"}\'',
        "processArguments": {
            "args": [],
            "env": {
                "DYLD_INSERT_LIBRARIES": LIBRARY_PATH,
                "APPLITOOLS_API_KEY": "abc",
                "APPLITOOLS_PROXY_URL": "http://proxy:1234",
                "APPLITOOLS_SERVER_URL": "https://server",
            },
        },
    }


def test_mobile_capabilities_explicit_proxy_settings():
    caps = {"capsKey": "capsValue"}
    Eyes.set_mobile_capabilities(caps, "abc", proxy_settings=ProxySettings("host", 81))

    assert caps == {
        "capsKey": "capsValue",
        "optionalIntentArguments": '--es APPLITOOLS \'{"APPLITOOLS_API_KEY": "abc", '
        '"APPLITOOLS_PROXY_URL": "http://host:81"}\'',
        "processArguments": {
            "args": [],
            "env": {
                "DYLD_INSERT_LIBRARIES": LIBRARY_PATH,
                "APPLITOOLS_API_KEY": "abc",
                "APPLITOOLS_PROXY_URL": "http://host:81",
            },
        },
    }


def test_mobile_capabilities_explicit_api_key_only(monkeypatch):
    monkeypatch.delenv("APPLITOOLS_SERVER_URL", False)
    monkeypatch.delenv("APPLITOOLS_HTTP_PROXY", False)
    caps = {"capsKey": "capsValue"}
    Eyes.set_mobile_capabilities(caps, "abc")

    assert caps == {
        "capsKey": "capsValue",
        "optionalIntentArguments": '--es APPLITOOLS \'{"APPLITOOLS_API_KEY": "abc"}\'',
        "processArguments": {
            "args": [],
            "env": {"DYLD_INSERT_LIBRARIES": LIBRARY_PATH, "APPLITOOLS_API_KEY": "abc"},
        },
    }


def test_mobile_capabilities_from_env(monkeypatch):
    monkeypatch.setenv("APPLITOOLS_API_KEY", "def")
    monkeypatch.setenv("APPLITOOLS_SERVER_URL", "https://otherserver")
    monkeypatch.setenv("APPLITOOLS_HTTP_PROXY", "http://secondproxy:2222")
    caps = {"capsKey": "capsValue"}
    Eyes.set_mobile_capabilities(caps)

    assert caps == {
        "capsKey": "capsValue",
        "optionalIntentArguments": '--es APPLITOOLS \'{"APPLITOOLS_API_KEY": "def", '
        '"APPLITOOLS_PROXY_URL": "http://secondproxy:2222", '
        '"APPLITOOLS_SERVER_URL": "https://otherserver"}\'',
        "processArguments": {
            "args": [],
            "env": {
                "DYLD_INSERT_LIBRARIES": LIBRARY_PATH,
                "APPLITOOLS_API_KEY": "def",
                "APPLITOOLS_PROXY_URL": "http://secondproxy:2222",
                "APPLITOOLS_SERVER_URL": "https://otherserver",
            },
        },
    }


def test_mobile_capabilities_from_env_api_key_only(monkeypatch):
    monkeypatch.setenv("APPLITOOLS_API_KEY", "def")
    caps = {"capsKey": "capsValue"}
    Eyes.set_mobile_capabilities(caps)

    assert caps == {
        "capsKey": "capsValue",
        "optionalIntentArguments": '--es APPLITOOLS \'{"APPLITOOLS_API_KEY": "def"}\'',
        "processArguments": {
            "args": [],
            "env": {"DYLD_INSERT_LIBRARIES": LIBRARY_PATH, "APPLITOOLS_API_KEY": "def"},
        },
    }


def test_mobile_capabilities_no_api_key_raises_exception(monkeypatch):
    monkeypatch.delenv("APPLITOOLS_API_KEY", False)
    caps = {"capsKey": "capsValue"}
    with pytest.raises(EyesError):
        Eyes.set_mobile_capabilities(caps)


def test_mobile_capabilities_compat_alias():
    caps = {}
    Eyes.set_nmg_capabilities(caps, "abc")

    assert caps == {
        "optionalIntentArguments": '--es APPLITOOLS \'{"NML_API_KEY": "abc"}\'',
        "processArguments": {
            "args": [],
            "env": {
                "DYLD_INSERT_LIBRARIES": (
                    "@executable_path/Frameworks/UFG_lib.xcframework/"
                    "ios-arm64_x86_64-simulator/UFG_lib.framework/UFG_lib:"
                    "@executable_path/Frameworks/UFG_lib.xcframework/"
                    "ios-arm64/UFG_lib.framework/UFG_lib"
                ),
                "NML_API_KEY": "abc",
            },
        },
    }
