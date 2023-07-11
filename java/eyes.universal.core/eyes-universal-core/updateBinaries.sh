#!/bin/bash

chmod +x ../../../scripts/download-core-bin.sh
./../../../scripts/download-core-bin.sh "$1" "$2"

mv ./core-alpine ../eyes-universal-core-alpine/src/main/resources
mv ./core-linux ../eyes-universal-core-linux/src/main/resources
mv ./core-linux-arm64 ../eyes-universal-core-arm/src/main/resources
mv ./core-macos ../eyes-universal-core-mac/src/main/resources
mv ./core-win.exe ../eyes-universal-core-win/src/main/resources