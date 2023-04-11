import pytest

flaky_tests = {
    "test_CheckWindowFullyOnAndroidChromeEmulatorOnMobilePageWithHorizontalScroll": 3
}


@pytest.hookimpl(tryfirst=True)
def pytest_collection_modifyitems(items):
    for test in items:
        should_rerun_times = flaky_tests.get(test.name)
        if should_rerun_times:
            test.add_marker(pytest.mark.flaky(reruns=should_rerun_times))
