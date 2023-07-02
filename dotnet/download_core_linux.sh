#!/usr/bin/env bash

wget https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40$CORE_VERSION/core-linux
mkdir -p ./Eyes.Image.Core.DotNet/runtimes/linux-x64/native/
mv core-linux ./Eyes.Image.Core.DotNet/runtimes/linux-x64/native/