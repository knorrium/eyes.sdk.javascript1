import io
from os import chdir, getcwd, path, remove

from pytest import fixture
from robot import run


@fixture
def robot(request):
    test_name = request.node.name
    artifacts = {
        "log": "{}_log.html".format(test_name),
        "output": "{}_output.xml".format(test_name),
        "report": "{}_report.html".format(test_name),
    }

    def run_robot(*tests, **args):
        cur_dir = getcwd()
        chdir(path.join(path.dirname(__file__), "regression"))
        try:
            args = args.copy()
            args["stdout"] = io.StringIO()
            args["stderr"] = io.StringIO()
            args.update(artifacts)
            ret_code = run(*tests, **args)
            return ret_code, args["stdout"].getvalue(), args["stderr"].getvalue()
        finally:
            chdir(cur_dir)

    yield run_robot
    for file in artifacts.values():
        if path.exists(file):
            remove(file)


def test_robot_suite_with_one_test_without_eyes(robot):
    ret_code, stdout, stderr = robot("test_without_eyes.robot")
    assert not stderr
