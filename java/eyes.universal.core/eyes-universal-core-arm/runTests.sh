#!/bin/bash

# Abort on Error
set -e;

export APPLITOOLS_LOG_DIR="./reports/logs/";


# install github cli (gh)
sudo apt update
sudo apt install wget -y
# Download the gh binary for arm64 (for buildjet-2vcpu-ubuntu-2204-arm)
wget https://github.com/cli/cli/releases/download/v2.20.2/gh_2.20.2_linux_arm64.tar.gz
tar -xvf gh_2.20.2_linux_arm64.tar.gz
sudo mv gh_2.20.2_linux_arm64/bin/gh /usr/bin/
# Verify the installation
gh --version

# build eyes-common-java and core-arm before the test so it exist in maven local repo
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