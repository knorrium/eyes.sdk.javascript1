#!/bin/bash

# module: eyes-universal-core-arm
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
  # install github cli (gh)
  sudo apt update
  sudo apt install wget -y
  # Download the gh binary for arm64 (for buildjet-2vcpu-ubuntu-2204-arm)
  wget https://github.com/cli/cli/releases/download/v2.20.2/gh_2.20.2_linux_arm64.tar.gz
  tar -xvf gh_2.20.2_linux_arm64.tar.gz
  sudo mv gh_2.20.2_linux_arm64/bin/gh /usr/bin/
  # Verify the installation
  gh --version

  # update core binaries to latest
  chmod +x ../../../scripts/download-core-bin.sh
  ./../../../scripts/download-core-bin.sh --platform linux-arm64 --dir "./src/main/resources"
else
  echo "Found js/core binaries"
  ls
  cp ../../../js/packages/core/bin/core-linux-arm64 ./src/main/resources
fi

# build current module
mvn clean install -P "$1" -DskipTests
