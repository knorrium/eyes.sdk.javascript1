#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";

# remove the DISPLAY variable
unset DISPLAY

# Run module tests
mvn test -e -X;