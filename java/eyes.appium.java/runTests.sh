#!/bin/bash

# Abort on Error
set -e;

echo "Testing with type: $TEST_TYPE"
if [[ ! "$TEST_TYPE" == *"coverage"* ]]; then
  # Run the default suite file
  echo "Running module specific tests!"
  mvn test -e -X
fi

if [[ "$TEST_TYPE" == *"coverage"* || "$TEST_TYPE" == *"all"* ]]; then
  # Run coverage tests
  echo "Running coverage tests!"

  chmod +x ./generic_tests.sh;
  ./generic_tests.sh;
fi