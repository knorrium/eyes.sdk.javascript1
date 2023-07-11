#!/bin/bash


RESULT=0
MESSAGE=""

yarn install
if [ "$?" -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'\n npm install have failed'
    echo "${MESSAGE}"
fi

yarn generate
if [ "$?" -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'\n unable to generate tests'
    echo "${MESSAGE}"
fi

mvn clean test -DsuiteFile=genericTestsSuite.xml
if [ "$?" -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'\n test run have failed'
    echo "${MESSAGE}"
fi

echo "RESULT = ${RESULT}"
echo "$MESSAGE"
if [ "$RESULT" -eq 0 ]; then
    exit 0
else
    exit "$RESULT"
fi