#!/bin/bash
# Inputs:
#   - EG [boolean] ; should run tests on Execution Cloud

RESULT=0
MESSAGE=""

yarn install
if [ "$?" -ne 0 ]; then
    ((RESULT+=1))
    MESSAGE+=$'\n npm install have failed'
    echo "${MESSAGE}"
fi

# Run UFG tests on EC
if [[ "$1" == "true" ]]; then
  export UFG_ON_EG=true
  export APPLITOOLS_SHOW_LOGS=true
  export EXECUTION_GRID_URL=http://localhost:8080
  yarn universal:eg &
  EG_PID="$!"
else
  export UFG_ON_EG=false
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

# Kill eg client by the process id
if [[ "$1" == "true" ]]; then
  echo $EG_PID
  kill $EG_PID
fi

echo "RESULT = ${RESULT}"
echo "$MESSAGE"
if [ "$RESULT" -eq 0 ]; then
    exit 0
else
    exit "$RESULT"
fi