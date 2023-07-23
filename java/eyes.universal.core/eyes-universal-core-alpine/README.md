# eyes-universal-core-alpine
Internal module of the Java SDKs to manage universal core alpine binary.

The actual binaries do not exist in the repository. During CI testing and release the binaries will be provided by 
`js/core` build artifact or by download if the artifact doesn't exist.

For local development, run `build.sh` from the directory of this module
which will download the latest `js/core` release and install the module.