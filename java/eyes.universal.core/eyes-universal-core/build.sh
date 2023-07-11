#!/bin/bash

# module: eyes-universal-core
# dependencies: [eyes-common-java5]

PRE_BUILDS=(
  "../../eyes.common.java"
)

# build dependant modules
for build_path in "${PRE_BUILDS[@]}"; do
  echo "in $(pwd)"
  echo "Executing build in: $build_path"
  cd "$build_path" || exit
  chmod +x "build.sh"
  ./build.sh "$1"
  cd - || exit
done

# build current module
mvn clean install -P "$1" -DskipTests

POST_BUILDS=(
  "../eyes-universal-core-alpine"
  "../eyes-universal-core-arm"
  "../eyes-universal-core-linux"
  "../eyes-universal-core-mac"
  "../eyes-universal-core-win"
)

# build dependant modules
for build_path in "${POST_BUILDS[@]}"; do
  echo "in $(pwd)"
  echo "Executing build in: $build_path"
  cd "$build_path" || exit
  chmod +x "build.sh"
  ./build.sh "$1"
  cd - || exit
done
