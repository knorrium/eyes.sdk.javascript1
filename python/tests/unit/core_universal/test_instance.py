import sys
from subprocess import PIPE, Popen
from time import sleep

import psutil
import pytest

from applitools.core_universal import get_instance


def test_server_instance():
    instance = get_instance()

    assert isinstance(instance.port, int)


@pytest.mark.parametrize("reason", ["normal", "crash"])
def test_automatic_core_universal_termination_on_python_termination(reason):
    # A simple python program that executes core-universal and waits on stdin
    code = (
        "import ctypes;"
        "import sys;"
        "from applitools.core_universal import get_instance;"
        "print(get_instance());"
        "sys.stdout.flush();"
        "sys.stdin.readline();"
    )
    if reason == "crash":
        code += "str(ctypes.cast(1, ctypes.py_object));"
    python_process = Popen([sys.executable, "-c", code], stdin=PIPE, stdout=PIPE)
    output_line = python_process.stdout.readline()
    assert output_line.startswith(b"SDKServer")
    (core_universal,) = psutil.Process(python_process.pid).children()
    assert core_universal.is_running()
    python_process.stdin.write(b"\n")
    python_process.stdin.flush()
    python_process.wait()
    sleep(2)  # core-universal receives EOF on stdin and terminates, might take time

    # psutils returns True when asking .is_running() on zombie process
    # so have to check status explicitly
    try:
        core_universal_status = core_universal.status()
    except psutil.NoSuchProcess:
        core_universal_status = "terminated"
    # GitHub Actions running tests in alpine container do not reap
    # terminated core_universal leaving it as a zombie.
    # Looks like there is nothing we can do about it except accept.
    assert core_universal_status in ("terminated", "zombie")
