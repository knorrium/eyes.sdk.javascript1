#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";

# build eyes-common-java and core-alpine before the test so it exist in maven local repo
BUILDS=(
  "../../eyes.common.java"
)

# build dependant modules
for build_path in "${BUILDS[@]}"; do
  echo "in $(pwd)"
  echo "Executing build in: $build_path"
  cd "$build_path" || exit
  chmod +x "build.sh"
  ./build.sh
  cd - || exit
done

# build current module
chmod +x build.sh
./build.sh

echo "Checking grep pattern: $MAVEN_GREP"
# Run the default suite file
if [ -n "$MAVEN_GREP" ]; then
  mvn -f ../eyes-universal-core/pom.xml test -Dtest="$MAVEN_GREP" -e -X
else
  mvn test -e -X
fi
