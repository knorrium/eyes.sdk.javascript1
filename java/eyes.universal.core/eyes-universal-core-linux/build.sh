#!/bin/bash

# module: eyes-universal-core-linux
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


if [ -z "$(ls -A ../../../js/packages/core/bin)" ]; then
  # update core binaries to latest
  chmod +x ../../../scripts/download-core-bin.sh
  ./../../../scripts/download-core-bin.sh --platform linux --dir "./src/main/resources"
  rm -f "./src/main/resources/core-linux-arm64"
else
  echo "Found js/core binaries"
  ls
  mkdir -p src/main/resources
  cp ../../../js/packages/core/bin/core-linux ./src/main/resources
fi

# build current module
mvn clean install -P "$1" -DskipTests
