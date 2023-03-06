from applitools.images import Configuration, Eyes


def test_eyes_set_configuration_clones_configuration():
    configuration = Configuration()
    configuration.set_test_name("abc")
    eyes = Eyes()

    eyes.set_configuration(configuration)
    configuration.set_test_name("def")

    assert eyes.configuration.test_name == "abc"


def test_eyes_get_configuration_clones_configuration():
    eyes = Eyes()
    eyes.configuration.set_test_name("abc")

    configuration = eyes.get_configuration()
    eyes.configuration.set_test_name("def")

    assert configuration.test_name == "abc"
