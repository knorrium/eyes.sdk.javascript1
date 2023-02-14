from itertools import count
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from typing import Text


class RefId(object):
    def __init__(self, object_registry_id, obj_id):
        # type: (Text, Text) -> None
        self.object_registry_id = object_registry_id
        self.obj_id = obj_id

    def __str__(self):
        return "{}:{}".format(self.object_registry_id, self.obj_id)

    @classmethod
    def from_str(cls, val):
        # type: (Text) -> RefId
        command_key, obj_id = val.rsplit(":", 1)
        return cls(command_key, obj_id)


class ObjectRegistry(object):
    _object_registry_id_gen = count(1)

    def __init__(self):
        # type: () -> None
        self.id = str(next(self._object_registry_id_gen))
        self._command_key_gen = count(1)

    def next_command_key(self):
        # type: () -> RefId
        return RefId(self.id, str(next(self._command_key_gen)))

    def marshal_driver(self, driver):
        raise NotImplementedError

    def marshal_element(self, element):
        raise NotImplementedError
