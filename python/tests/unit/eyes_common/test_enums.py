import re
from os import path

import pytest

from applitools.common import AndroidDeviceName, DeviceName, IosDeviceName

JS_ROOT = path.join(path.dirname(__file__), "../../../../js")


def _parse_ts_enum(name):
    source_file = path.join(JS_ROOT, "packages/eyes/src/enums/{}.ts".format(name))
    regex = re.escape(name) + r"Enum\s*\{([^}]+)}"
    with open(source_file) as ts_code:
        (enum_contents,) = re.findall(regex, ts_code.read())
    entries = (e.strip() for e in enum_contents.split(","))
    cleaned_entries = (e for e in entries if e and not e.startswith("//"))
    pairs = (e.split("=") for e in cleaned_entries)
    # remove quotes from values
    return {name.strip(): value.strip()[1:-1] for name, value in pairs}


@pytest.mark.parametrize("enum", (DeviceName, AndroidDeviceName, IosDeviceName))
def test_enum_matches_js(enum):
    ts_dict = _parse_ts_enum(enum.__name__)
    py_dict = {e.name: e.value for e in enum}

    assert py_dict == ts_dict


def test_android_device_name_compat_aliases():
    assert AndroidDeviceName.Galaxy_S20_PLUS == AndroidDeviceName.Galaxy_S20_Plus
    assert AndroidDeviceName.Galaxy_S21_PLUS == AndroidDeviceName.Galaxy_S21_Plus
    assert AndroidDeviceName.Galaxy_S21_ULTRA == AndroidDeviceName.Galaxy_S21_Ultra
