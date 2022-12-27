#!/bin/bash -
set -o nounset
find ../eyes-universal-arm64 -type f -not -name '*.zip' -not -name '*.tar.gz' -exec bash -c 'cp ${0} ./bin/$(basename ${0})' {} \;
rm -rf ./bin/*.tar.gz ./bin/*.zip
zip -j ./bin/eyes-universal.zip $(find ./bin -type f -not -name '*.zip' -not -name '*.tar.gz' | xargs)
tar -czf ./bin/eyes-universal.tar.gz $(find ./bin -type f -not -name '*.zip' -not -name '*.tar.gz' | xargs)
