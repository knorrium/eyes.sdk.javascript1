#!/bin/bash

# module: eyes-universal-core-alpine
# dependencies: []

BUILDS=()

# build dependant modules
for build_path in "${BUILDS[@]}"; do
  echo "in $(pwd)"
  echo "Executing build in: $build_path"
  cd "$build_path" || exit
  chmod +x "build.sh"
  ./build.sh "$1"
  cd - || exit
done

# update core binaries to latest
chmod +x ../../../scripts/download-core-bin.sh
./../../../scripts/download-core-bin.sh --platform alpine --dir "./src/main/resources"

# build current module
mvn clean install -P "$1" -DskipTests