#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";

# build eyes-universal-core before test
chmod +x ../eyes-universal-core/build.sh
../eyes-universal-core/build.sh;

echo "Checking grep pattern: $MAVEN_GREP"
# Run the default suite file
if [ -n "$MAVEN_GREP" ]; then
  mvn test -f ../eyes-universal-core/pom.xml -Dtest="$MAVEN_GREP" -e -X
else
  mvn test -e -X
fi