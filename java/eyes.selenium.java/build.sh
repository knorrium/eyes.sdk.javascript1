#!/bin/bash

# module: eyes-selenium-java5
# dependencies: [eyes-selenium-common-java5,
#                eyes-sdk-core-java5 (built inside common)
#                eyes-connectivity-java5 (built inside common)]

BUILDS=(
  "../eyes.selenium.common"
)

# build dependant modules
for build_path in "${BUILDS[@]}"; do
  echo "in $(pwd)"
  echo "Executing build in: $build_path"
  cd "$build_path" || exit
  chmod +x "build.sh"
  ./build.sh "$1"
  cd - || exit
done

# build current module
mvn clean install -P "$1" -DskipTests
