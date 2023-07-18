#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";

# Run module tests
mvn test -e -X;