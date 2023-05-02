import sys

# distutils is removed in python 3.12 but marshmallow<3
# needs distutils.version.LooseVersion class
# If distutils.version is not loaded yet, temporarily
# put custom version module in its place and load marshmallow.
# This helps to avoid distutils deprecation warning in python 3.11
if "distutils.version" not in sys.modules:
    from . import mmallow_version

    sys.modules["distutils.version"] = mmallow_version
    import marshmallow

    sys.modules.pop("distutils.version")

from marshmallow import Schema, post_dump, post_load
from marshmallow.fields import (
    Boolean,
    DateTime,
    Dict,
    Field,
    Float,
    Integer,
    List,
    Nested,
    String,
)
from marshmallow.schema import BaseSchema, SchemaMeta, with_metaclass

__all__ = [
    "BaseSchema",
    "Boolean",
    "DateTime",
    "Dict",
    "Field",
    "Float",
    "Integer",
    "List",
    "Nested",
    "Schema",
    "SchemaMeta",
    "String",
    "post_dump",
    "post_load",
    "with_metaclass",
]
