#!/usr/bin/env pwsh
Param
(
    [String] [Parameter(Mandatory=$true)] $CORE_VERSION = "3.1.1"
)

$version = ${env:CORE_VERSION}
wget -nv "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40$version/core-alpine"
wget -nv "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40$version/core-linux"
wget -nv "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40$version/core-linux-arm64"
wget -nv "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40$version/core-macos"
wget -nv "https://github.com/applitools/eyes.sdk.javascript1/releases/download/js%2Fcore%40$version/core-win.exe"
mkdir -p ./Eyes.Image.Core.DotNet/runtimes/linux-alpine/native/
mkdir -p ./Eyes.Image.Core.DotNet/runtimes/linux-x64/native/
mkdir -p ./Eyes.Image.Core.DotNet/runtimes/linux-arm64/native/
mkdir -p ./Eyes.Image.Core.DotNet/runtimes/osx-x64/native/
mkdir -p ./Eyes.Image.Core.DotNet/runtimes/win-x64/native/
mv core-alpine ./Eyes.Image.Core.DotNet/runtimes/linux-alpine/native/
mv core-linux ./Eyes.Image.Core.DotNet/runtimes/linux-x64/native/
mv core-linux-arm64 ./Eyes.Image.Core.DotNet/runtimes/linux-arm64/native/
mv core-macos ./Eyes.Image.Core.DotNet/runtimes/osx-x64/native/
mv core-win.exe ./Eyes.Image.Core.DotNet/runtimes/win-x64/native/