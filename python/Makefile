export APPLITOOLS_BATCH_ID=$(shell python -c "import uuid;print(str(uuid.uuid4()))")

install_dev_requirements: ensure_dev_venv install_installation_tests_requirements
	python -m pip install --upgrade --editable core_universal
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


install_eyes_images: eyes_images/dist install_core_universal
	python -m pip install eyes_images/dist/*


install_eyes_playwright: eyes_playwright/dist install_eyes_images
	python -m pip install eyes_playwright/dist/*
	python -m playwright install

install_eyes_selenium: eyes_selenium/dist install_eyes_images
	python -m pip install eyes_selenium/dist/*


install_eyes_robotframework: eyes_robotframework/dist install_eyes_selenium
	python -m pip install eyes_robotframework/dist/*


install_unit_tests_requirements:
	python -m pip install 'pytest<8' 'pytest-xdist<3' 'mock' 'psutil'


install_functional_tests_requirements: install_unit_tests_requirements
	python -m pip install 'pillow' 'requests' "webdriver-manager==3.7.0; python_version>='3'"


install_installation_tests_requirements: install_unit_tests_requirements
	python -m pip install 'pytest-venv==0.2.1' 'virtualenv==20.11'


install_selenium_generated_tests_requirements: install_functional_tests_requirements
	python -m pip install 'webdriver-manager==3.7.0'


install_publish_requirements:
	python -m pip install twine


uninstall:
	python -m pip uninstall -y eyes-robotframework eyes-selenium eyes_playwright eyes-images core-universal


publish_eyes_selenium: eyes_images/dist eyes_playwright/dist eyes_selenium/dist install_publish_requirements
	bash ./ci_scripts/send_mail.sh python ${SDK_VERSION} eyes_images/CHANGELOG.md
	twine upload --verbose eyes_images/dist/* eyes_playwright/dist/* eyes_selenium/dist/*


publish_testing_eyes_selenium: eyes_images/dist eyes_playwright/dist eyes_selenium/dist install_publish_requirements
	echo bash ./ci_scripts/send_mail.sh python ${SDK_VERSION} eyes_images/CHANGELOG.md
	twine upload --verbose --repository testpypi eyes_images/dist/* eyes_playwright/dist/* eyes_selenium/dist/*


publish_eyes_robotframework: eyes_robotframework/dist install_publish_requirements
	bash ./ci_scripts/send_mail.sh robotframework ${SDK_VERSION} eyes_robotframework/CHANGELOG.md
	twine upload --verbose eyes_robotframework/dist/*


publish_testing_eyes_robotframework: eyes_robotframework/dist install_publish_requirements
	echo bash ./ci_scripts/send_mail.sh robotframework ${SDK_VERSION} eyes_robotframework/CHANGELOG.md
	twine upload --verbose --repository testpypi eyes_robotframework/dist/*


publish_core_universal: core_universal/dist install_publish_requirements
	twine upload --verbose core_universal/dist/*


publish_testing_core_universal: core_universal/dist install_publish_requirements
	twine upload --verbose --repository testpypi core_universal/dist/*


dist: core_universal/dist eyes_images/dist eyes_playwright/dist eyes_selenium/dist eyes_robotframework/dist


core_universal/dist:
	python -m pip install --upgrade wheel
	set -e; cd core_universal; \
	for PLAT in macosx_10_7_x86_64 macosx_11_0_arm64 manylinux1_x86_64 manylinux2014_aarch64 musllinux_1_2_x86_64 win_amd64; \
	do python setup.py bdist_wheel --usdk-build-dir=${USDK_BUILD_DIR} --plat-name=$$PLAT; rm -rf build; done


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
	for PACK in core_universal eyes_images eyes_playwright eyes_selenium eyes_robotframework; \
	do rm -rf $$PACK/dist $$PACK/build $$PACK/$$PACK.egg-info; done


gen_robot_docs:
	python -m robot.libdoc --format html EyesLibrary docs/eyes_robotframework/keywords.html


eyes_selenium_unit_tests: install_eyes_robotframework install_unit_tests_requirements
	pytest -n6 tests/unit


eyes_selenium_installation_tests: install_eyes_robotframework install_installation_tests_requirements
	pytest tests/test_installation.py


eyes_selenium_generated_tests: install_eyes_selenium install_selenium_generated_tests_requirements
	chmod a+x ./coverage-tests/python_tests.sh
	npm run python:tests --prefix ./coverage-tests


eyes_playwright_generated_tests: install_eyes_playwright install_functional_tests_requirements
	cd coverage-tests && npm install
	npm run python:generate:playwright --prefix ./coverage-tests
	npm run python:run:parallel --prefix ./coverage-tests


eyes_images_functional_tests: install_eyes_images install_functional_tests_requirements
	pytest -n8 tests/functional/eyes_images/


eyes_robotframework_functional_tests: install_eyes_robotframework install_functional_tests_requirements
	pytest -n8 -m "not sauce" tests/functional/eyes_robotframework/test_integration.py


eyes_robotframework_sauce_functional_tests: install_eyes_robotframework install_functional_tests_requirements
	pytest -n4 -m sauce tests/functional/eyes_robotframework/test_integration.py


eyes_selenium_functional_tests: install_eyes_selenium install_functional_tests_requirements
	pytest -n8 -m "not sauce" tests/functional/eyes_selenium/


eyes_selenium_sauce_functional_tests: install_eyes_selenium install_functional_tests_requirements
	pytest -n4 -m sauce tests/functional/eyes_selenium/
