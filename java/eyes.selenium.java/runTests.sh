#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";

# Setup web drivers
echo "Geckodriver setup"
chmod +x ./../initGeckoDriver.sh;
sh ./../initGeckoDriver.sh;
export FIREFOX_DRIVER_PATH="/usr/local/bin/geckodriver";

echo "Testing with type: $TEST_TYPE"
if [[ ! "$TEST_TYPE" == *"coverage"* ]]; then
  # Run the default suite file
  mvn test -e -X
fi


if [[ "$TEST_TYPE" == *"coverage"* || "$TEST_TYPE" == *"all"* ]]; then
  # Run coverage tests
  echo "Running coverage tests!"

  chmod +x ./generic_tests.sh;
  ./generic_tests.sh;
fi