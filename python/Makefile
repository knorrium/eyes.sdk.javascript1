ifdef PYTEST_FILTER
	PYTEST_FLAGS= -k '$(PYTEST_FILTER)'
endif
PYTEST=python -m pytest $(PYTEST_FLAGS)

install_dev_requirements: ensure_dev_venv install_unit_tests_requirements install_installation_tests_requirements install_robotframework_tests_requirements generate_images_tests generate_selenium_tests generate_appium_tests generate_playwright_tests
	python -m pip install --upgrade --editable core_universal
	python -m pip install --upgrade --editable eyes_common
	python -m pip install --upgrade --editable eyes_images
	python -m pip install --upgrade --editable eyes_selenium
	python -m pip install --upgrade --editable eyes_robotframework
ifeq ($(shell python -c 'import sys; print(sys.version_info >= (3,7))'),True)
	python -m pip install --upgrade --editable eyes_playwright
	python -m playwright install
else
	@echo Playwright is not available in `python --version`
endif
	python -m pip install --upgrade pre-commit

ensure_dev_venv:
ifdef VIRTUAL_ENV
	@echo Using Python from ${VIRTUAL_ENV}
else
	@echo Creating development virtualenvs
	python2.7 -m virtualenv venv/2.7
	python3.6 -m venv venv/3.6
	python3.11 -m venv venv/3.11 --upgrade-deps
	@echo Please activate a virtualenv && false
endif

install_core_universal: core_universal/dist
	python -m pip install --no-index --find-links=file:core_universal/dist/ core_universal


install_eyes_common: eyes_common/dist install_core_universal
	python -m pip install eyes_common/dist/*


install_eyes_images: eyes_images/dist install_eyes_common
	python -m pip install eyes_images/dist/*


install_eyes_playwright: eyes_playwright/dist install_eyes_common
ifeq ($(shell python -c 'import sys,os; print(sys.version_info<(3,7) or os.path.exists("/etc/alpine-release"))'),True)
	@echo Playwright is not available in `python --version`
else
	python -m pip install 'playwright<1.34'
	python -m pip install eyes_playwright/dist/*
	python -m playwright install
endif

install_eyes_selenium: eyes_selenium/dist install_eyes_common
	python -m pip install eyes_selenium/dist/*


install_eyes_robotframework: eyes_robotframework/dist install_eyes_selenium
	python -m pip install eyes_robotframework/dist/*


install_tests_requirements:
	python -m pip install 'pytest<8' 'pytest-xdist<3' 'mock' "pytest-rerunfailures<11; python_version>='3'"


install_unit_tests_requirements: install_tests_requirements
	python -m pip install 'psutil'


install_functional_tests_requirements: install_tests_requirements
	python -m pip install 'pillow' "futures<4; python_version<'3.0'"


install_installation_tests_requirements: install_tests_requirements
	python -m pip install 'pytest-venv==0.2.1' 'virtualenv==20.11'


install_robotframework_tests_requirements: install_tests_requirements
	python -m pip install 'robotframework-pabot'


install_selenium_generated_tests_requirements: install_functional_tests_requirements
	python -m pip install "webdriver-manager==3.7.0; python_version>='3'"


install_publish_requirements: node_modules
	python -m pip install twine


generate_images_tests: node_modules
	cd tests/coverage/images && npx coverage-tests generate . --pascalizeTests --strict


generate_appium_tests: node_modules
	cd tests/coverage/appium && npx coverage-tests generate . --pascalizeTests --strict


generate_selenium_tests: install_selenium_generated_tests_requirements node_modules
	cd tests/coverage/selenium && npx coverage-tests generate . --pascalizeTests --strict


generate_playwright_tests: node_modules
	cd tests/coverage/playwright && npx coverage-tests generate . --pascalizeTests --strict


uninstall:
	python -m pip uninstall -y eyes-robotframework eyes-selenium eyes_playwright eyes-images eyes-common core-universal


publish_core_universal: core_universal/dist install_publish_requirements
	twine upload --verbose core_universal/dist/*


publish_testing_core_universal: core_universal/dist install_publish_requirements
	twine upload --verbose --repository testpypi core_universal/dist/*


publish_eyes_common: eyes_common/dist install_publish_requirements
	twine upload --verbose eyes_common/dist/*


publish_testing_eyes_common: eyes_common/dist install_publish_requirements
	twine upload --verbose --repository testpypi  eyes_common/dist/*


publish_eyes_images: eyes_images/dist install_publish_requirements
	twine upload --verbose eyes_images/dist/*


publish_testing_eyes_images: eyes_images/dist install_publish_requirements
	twine upload --verbose --repository testpypi  eyes_images/dist/*


publish_eyes_selenium: eyes_images/dist eyes_playwright/dist eyes_selenium/dist install_publish_requirements
	cd eyes_selenium && npx bongo send-release-notification --verbose --name python --releaseVersion "${SDK_VERSION}"
	twine upload --verbose eyes_selenium/dist/*


publish_testing_eyes_selenium: eyes_images/dist eyes_playwright/dist eyes_selenium/dist install_publish_requirements
	twine upload --verbose --repository testpypi eyes_selenium/dist/*


publish_eyes_playwright: eyes_playwright/dist install_publish_requirements
	cd eyes_playwright && npx bongo send-release-notification --verbose --name python_playwright --releaseVersion "${SDK_VERSION}"
	twine upload --verbose eyes_playwright/dist/*


publish_testing_eyes_playwright: eyes_playwright/dist install_publish_requirements
	twine upload --verbose --repository testpypi  eyes_playwright/dist/*


publish_eyes_robotframework: eyes_robotframework/dist install_publish_requirements
	cd eyes_robotframework && npx bongo send-release-notification --verbose --name robotframework --releaseVersion "${SDK_VERSION}"
	twine upload --verbose eyes_robotframework/dist/*


publish_testing_eyes_robotframework: eyes_robotframework/dist install_publish_requirements
	twine upload --verbose --repository testpypi eyes_robotframework/dist/*


dist: core_universal/dist eyes_common/dist eyes_images/dist eyes_playwright/dist eyes_selenium/dist eyes_robotframework/dist


core_universal/dist:
	python -m pip install --upgrade wheel
	set -e; cd core_universal; \
	for PLAT in macosx_10_7_x86_64 macosx_11_0_arm64 manylinux1_x86_64 manylinux2014_aarch64 musllinux_1_2_x86_64 win_amd64; \
	do python setup.py bdist_wheel --usdk-build-dir=${USDK_BUILD_DIR} --plat-name=$$PLAT; rm -rf build; done


eyes_common/dist:
	python -m pip install --upgrade wheel
	cd eyes_common && python setup.py bdist_wheel


eyes_images/dist:
	python -m pip install --upgrade wheel
	cd eyes_images && python setup.py bdist_wheel


eyes_playwright/dist:
	python -m pip install --upgrade wheel
	cd eyes_playwright && python setup.py bdist_wheel


eyes_selenium/dist:
	python -m pip install --upgrade wheel
	cd eyes_selenium && python setup.py bdist_wheel


eyes_robotframework/dist:
	python -m pip install --upgrade wheel
	cd eyes_robotframework && python setup.py bdist_wheel


clean:
	for PACK in core_universal eyes_common eyes_images eyes_playwright eyes_selenium eyes_robotframework; \
	do rm -rf $$PACK/dist $$PACK/build $$PACK/$$PACK.egg-info; done
	rm -rf node_modules


gen_robot_docs:
	python -m robot.libdoc --format html EyesLibrary docs/eyes_robotframework/keywords.html


unit_tests: install_eyes_images install_eyes_playwright install_eyes_robotframework install_unit_tests_requirements
	$(PYTEST) -n6 tests/unit


eyes_selenium_unit_tests: unit_tests


eyes_selenium_installation_tests: install_eyes_images install_eyes_robotframework install_eyes_playwright install_installation_tests_requirements


eyes_selenium_installation_tests: install_eyes_images install_eyes_robotframework install_installation_tests_requirements
	$(PYTEST) tests/test_installation.py


eyes_images_generated_tests: install_eyes_images install_tests_requirements generate_images_tests
	# cd into suite directory required because coverage-tests-metadata.json is there
	cd tests/coverage/images && $(PYTEST) -n 14 --durations=10 generic/*


eyes_appium_generated_tests: install_eyes_selenium install_selenium_generated_tests_requirements generate_appium_tests
	python -m pip freeze
	# cd into suite directory required because coverage-tests-metadata.json is there
	cd tests/coverage/appium && $(PYTEST) -n 4 --durations=10 --dist loadgroup generic/*


eyes_selenium_generated_tests: install_eyes_selenium install_selenium_generated_tests_requirements generate_selenium_tests
	python -m pip freeze
	# cd into suite directory required because coverage-tests-metadata.json is there
	cd tests/coverage/selenium && $(PYTEST) -n 14 --durations=10 --dist loadgroup generic/*


eyes_playwright_generated_tests: install_eyes_playwright install_functional_tests_requirements generate_playwright_tests
	python -m pip freeze
	# cd into suite directory required because coverage-tests-metadata.json is there
	cd tests/coverage/playwright && $(PYTEST) -n 10 --durations=10 generic/*


eyes_images_functional_tests: install_eyes_images install_functional_tests_requirements
	$(PYTEST) -n8 tests/functional/eyes_images/


eyes_playwright_functional_tests: install_eyes_playwright install_functional_tests_requirements
	$(PYTEST) -n8 tests/functional/eyes_playwright/


eyes_robotframework_functional_tests: install_eyes_robotframework install_functional_tests_requirements install_robotframework_tests_requirements
	$(PYTEST) -n8 -m "not sauce_vm and not sauce_mac_vm" tests/functional/eyes_robotframework


eyes_robotframework_sauce_functional_tests: install_eyes_robotframework install_functional_tests_requirements install_robotframework_tests_requirements
	$(PYTEST) -n4 -m "sauce_vm or sauce_mac_vm" --dist loadgroup tests/functional/eyes_robotframework


eyes_selenium_functional_tests: install_eyes_selenium install_functional_tests_requirements
	$(PYTEST) -n8 tests/functional/eyes_selenium/


eyes_images_all_tests: eyes_images_generated_tests eyes_images_functional_tests


eyes_selenium_all_tests: eyes_selenium_generated_tests eyes_appium_generated_tests unit_tests


eyes_playwright_all_tests: eyes_playwright_generated_tests eyes_playwright_functional_tests


eyes_robotframework_all_tests: eyes_robotframework_functional_tests eyes_robotframework_sauce_functional_tests


node_modules:
	npm install '@applitools/sdk-coverage-tests' 'prettier'
