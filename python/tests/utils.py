from os import path

TESTS_DIR = path.dirname(path.abspath(__file__))


def get_resource_path(name):
    resource_dir = path.join(TESTS_DIR, "resources")
    return path.join(resource_dir, name)


def get_resource(name):
    pth = get_resource_path(name)
    with open(pth, "rb") as f:
        return f.read()
