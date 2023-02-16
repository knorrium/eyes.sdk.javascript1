#!/bin/bash
RESULT=0
MESSAGE=""
npm install
if [ $? -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'\n npm install have failed'
    echo "${MESSAGE}"
fi
export UFG_ON_EG=true
npm run python:generate
if [ $? -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'\n npm run python:generate have failed'
    echo "${MESSAGE}"
fi

npm run python:run:parallel
if [ $? -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'npm run python:run:parallel have failed'
    echo "${MESSAGE}"
fi

npm run python:report
if [ $? -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'npm run python:report have failed'
    echo "${MESSAGE}"
fi
echo "RESULT = ${RESULT}"
echo "${MESSAGE}"
if [ $RESULT -eq 0 ]; then
    exit 0
else
    exit 1
fi
