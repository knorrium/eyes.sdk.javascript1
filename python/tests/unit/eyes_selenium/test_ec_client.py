from mock import ANY, call, patch
from six import PY2

from applitools.common import ProxySettings
from applitools.selenium import Eyes


def test_get_execution_cloud_url_no_args(monkeypatch):
    with patch(
        "applitools.selenium.command_executor.CommandExecutor._checked_command"
    ) as c:
        Eyes.get_execution_cloud_url()

        if PY2:  # work around __getitem__ bug in old mock
            assert c.mock_calls[:-1] == [
                call(ANY, "Core.makeECClient", {"settings": {}}),
            ]
            assert str(c.mock_calls[-1]) == "call().__getitem__(u'url')"
        else:
            assert c.mock_calls == [
                call(ANY, "Core.makeECClient", {"settings": {}}),
                call().__getitem__("url"),
            ]


def test_get_execution_cloud_url_all_args(monkeypatch):
    with patch(
        "applitools.selenium.command_executor.CommandExecutor._checked_command"
    ) as c:
        Eyes.get_execution_cloud_url("key", "url", ProxySettings("http://u:p@host:80"))

        if PY2:
            assert c.mock_calls[:-1] == [
                call(
                    ANY,
                    "Core.makeECClient",
                    {
                        "settings": {
                            "proxy": {
                                "password": "p",
                                "username": "u",
                                "url": "http://u:p@host:80",
                            },
                            "capabilities": {"apiKey": "key", "serverUrl": "url"},
                        }
                    },
                )
            ]
            assert str(c.mock_calls[-1]) == "call().__getitem__(u'url')"
        else:
            assert c.mock_calls == [
                call(
                    ANY,
                    "Core.makeECClient",
                    {
                        "settings": {
                            "proxy": {
                                "password": "p",
                                "username": "u",
                                "url": "http://u:p@host:80",
                            },
                            "capabilities": {"apiKey": "key", "serverUrl": "url"},
                        }
                    },
                ),
                call().__getitem__("url"),
            ]
