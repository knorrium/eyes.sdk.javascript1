#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";

#echo "Checking grep pattern: $MAVEN_GREP"
#if [ -n "$MAVEN_GREP" ]; then
#  mvn test -Dtest="$MAVEN_GREP" -e -X
#else
#  # Run the default suite file
#  mvn test -e -X
#fi