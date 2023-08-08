from applitools import common
from applitools.common.command_executor import collect_versions_of_packages


def test_collect_version_of_existing_package():
    versions = collect_versions_of_packages("eyes_common")

    assert versions == {"eyes_common": common.__version__}


def test_collect_version_of_non_existing_package():
    versions = collect_versions_of_packages("nonexistent")

    assert versions == {}
