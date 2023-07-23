# eyes-universal-core
Internal module of the Java SDKs to manage universal core binaries.

Each binary has its respective module, and an additional module with all binaries inside:
```text
eyes-universal-core-linux
eyes-universal-core-linux-arm
eyes-universal-core-alpine
eyes-universal-core-mac
eyes-universal-core-win
eyes-universal-core-binaries
```

The actual binaries do not exist in the repository. During CI testing and release the binaries will be provided by 
`js/core` build artifact or by download if the artifact doesn't exist.

For local development, run `eyes-universal-core-<your_os>/build.sh` from the directory of the module matching your OS,
which will download the latest `js/core` release and install the module.

