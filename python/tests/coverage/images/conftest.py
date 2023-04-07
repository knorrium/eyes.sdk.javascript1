import sys

from pytest import fixture

from applitools.images import BatchInfo, Eyes

batch_info = BatchInfo("Py{}.{} images Generated tests".format(*sys.version_info[:2]))


@fixture
def eyes():
    """
    Basic Eyes setup. It'll abort test if wasn't closed properly.
    """
    eyes = Eyes()
    eyes.configure.batch = batch_info
    eyes.configure.branch_name = "master"
    eyes.configure.parent_branch_name = "master"
    eyes.configure.set_save_new_tests(False)
    yield eyes
    # If the test was aborted before eyes.close was called, ends the test as aborted.
    eyes.abort()
