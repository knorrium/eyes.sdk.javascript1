from pathlib import Path
from re import sub

import pytest
import yaml

GEN_DIR = Path(__file__).parent / "generated"
TEMPLATES = Path(__file__).parent / "templates"

GEN_DIR.mkdir(exist_ok=True)


@pytest.fixture
def robot_suite_maker(request):
    suite_name = sub(r"[^\w0-9.]", "_", request.node.name)
    templates = request.node.get_closest_marker("templates")
    if templates:
        return RobotSuiteMaker(suite_name, templates.args)
    else:
        template = sub("^test_|__.+$", "", request.node.originalname)
        return RobotSuiteMaker(suite_name, [template])


@pytest.fixture
def robot_suite(robot_suite_maker):
    return robot_suite_maker.make()


class RobotSuiteMaker:
    def __init__(self, name, templates):
        self.name = name
        self.templates = templates

    def make(self, config=None, **vars):
        suite_dir = GEN_DIR / self.name
        suite_dir.mkdir(exist_ok=True)
        for template in self.templates:
            template += ".robot"
            input_file = TEMPLATES / template
            output_file = suite_dir / template
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(input_file.read_text())
        config_text = (TEMPLATES / "applitools.yaml").read_text()
        if config:
            yaml_config = yaml.safe_load(config_text)
            yaml_config.update(config)
            config_text = yaml.safe_dump(yaml_config)
        (suite_dir / "applitools.yaml").write_text(config_text)
        if vars:
            code = "\n".join("{} = {!r}".format(k.upper(), v) for k, v in vars.items())
            (suite_dir / "vars.py").write_text(code)
        return suite_dir
