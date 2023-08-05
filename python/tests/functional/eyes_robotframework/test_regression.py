import io
from os import chdir, getcwd, path, remove

from pytest import fixture
from robot import run
from selenium.webdriver.common.by import By


@fixture
def robot(request):
    test_name = request.node.name
    test_log = "{}_log.html".format(test_name)
    artifacts = {
        "log": test_log,
        "output": "{}_output.xml".format(test_name),
        "report": "{}_report.html".format(test_name),
    }

    def run_robot(**args):
        cur_dir = getcwd()
        chdir(path.join(path.dirname(__file__), "regression"))
        try:
            args = args.copy()
            args["stdout"] = io.StringIO()
            args["stderr"] = io.StringIO()
            args.update(artifacts)
            ret_code = run(test_name + ".robot", **args)
            log = path.join(cur_dir, test_log)
            return ret_code, args["stdout"].getvalue(), args["stderr"].getvalue(), log
        finally:
            chdir(cur_dir)

    yield run_robot
    for file in artifacts.values():
        if path.exists(file):
            remove(file)


def test_robot_suite_with_one_test_without_eyes(robot):
    ret_code, stdout, stderr, log = robot()
    assert not stderr


def test_propagate_results_inside_custom_keywords(robot, local_chrome_driver):
    ret_code, stdout, stderr, log = robot()

    assert not stderr, stdout

    local_chrome_driver.get("file:///" + log)
    first_call = local_chrome_driver.find_element(By.CSS_SELECTOR, "#s1-t1-k2")
    assert "KEYWORD Process Test1" in first_call.text
    assert first_call.find_element(By.CSS_SELECTOR, "span.label.pass")
    second_call = local_chrome_driver.find_element(By.CSS_SELECTOR, "#s1-t1-k6")
    assert "KEYWORD Process Test2" in second_call.text
    assert second_call.find_element(By.CSS_SELECTOR, "span.label.fail")
    sub_call = local_chrome_driver.find_element(By.CSS_SELECTOR, "#s1-t1-k6-k1")
    assert "KEYWORD EyesLibrary . Eyes Check Window" in sub_call.text
    assert sub_call.find_element(By.CSS_SELECTOR, "span.label.fail")
