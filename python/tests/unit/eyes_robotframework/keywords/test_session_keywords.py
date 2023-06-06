import pytest
from mock import ANY, Mock, call, patch

from applitools.selenium import Eyes
from EyesLibrary import SessionKeywords


@pytest.fixture
def session_keyword(eyes_library_with_selenium):
    eyes_library_with_selenium.register_eyes(Mock(Eyes), None)
    return SessionKeywords(eyes_library_with_selenium)


def test_get_execution_cloud_url(session_keyword, eyes_library_with_selenium):
    eyes_library_with_selenium._configuration.set_proxy("http://proxyhost:123")
    eyes_library_with_selenium._configuration.set_server_url("https://eyes.server")

    with patch(
        "applitools.common.command_executor.CommandExecutor._checked_command"
    ) as c:
        session_keyword.get_execution_cloud_url()
        # the last element in mock call triggers mock error on Python 2
        # it is covered by other unit tests so just skip it
        assert c.mock_calls[:-1] == [
            call(
                ANY,
                "Core.getECClient",
                {
                    "settings": {
                        "options": {
                            "apiKey": "SOME API KEY",
                            "serverUrl": "https://eyes.server",
                        },
                        "proxy": {"url": "http://proxyhost:123"},
                    }
                },
            ),
        ]
