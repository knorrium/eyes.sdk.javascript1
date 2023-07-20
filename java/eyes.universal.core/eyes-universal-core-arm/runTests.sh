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

echo "Checking grep pattern: $MAVEN_GREP"
# Run the default suite file
if [ -n "$MAVEN_GREP" ]; then
  mvn -f ../eyes-universal-core/pom.xml test -Dtest="$MAVEN_GREP" -e -X
else
  mvn test -e -X
fi