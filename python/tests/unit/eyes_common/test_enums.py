import re
from os import path

import pytest

from applitools.common import AndroidDeviceName, DeviceName, IosDeviceName

JS_ROOT = path.join(path.dirname(__file__), "../../../../js")


def _parse_ts_enum(name):
    source_file = path.join(JS_ROOT, "packages/eyes/src/enums/{}.ts".format(name))
    regex = re.escape(name) + r"Enum\s*\{(.+)\n\}"
    with open(source_file) as ts_code:
        (enum_contents,) = re.findall(regex, ts_code.read(), re.DOTALL)
    lines = (e.strip() for e in enum_contents.split("\n"))
    # skip empty lines and comments and remove commas
    cleaned_lines = (e[:-1] for e in lines if e and not e.startswith("/"))
    pairs = (e.split("=") for e in cleaned_lines)
    # remove quotes from values
    return {name.strip(): value.strip()[1:-1] for name, value in pairs}


@pytest.mark.parametrize("enum", (DeviceName, AndroidDeviceName, IosDeviceName))
def test_enum_matches_js(enum):
    ts_dict = _parse_ts_enum(enum.__name__)
    py_dict = {key: e.value for (key, e) in enum.__members__.items()}

    assert py_dict == ts_dict


def test_android_device_name_compat_aliases():
    assert AndroidDeviceName.Galaxy_S20_PLUS == AndroidDeviceName.Galaxy_S20_Plus
    assert AndroidDeviceName.Galaxy_S21_PLUS == AndroidDeviceName.Galaxy_S21_Plus
    assert AndroidDeviceName.Galaxy_S21_ULTRA == AndroidDeviceName.Galaxy_S21_Ultra
