*** Settings ***
Library     AppiumLibrary
Library     Collections
Library     EyesLibrary     runner=${RUNNER}    config=applitools.yaml
Library     String

Test Setup       Setup
Test Teardown    Teardown

*** Keywords ***
Setup
    ${DESIRED_CAPS}=     Eyes Create NMG Capabilities    &{DESIRED_CAPS}
    ${SAUCE_TEST_NAME}=  Format String                   Robot|{} {}  ${RUNNER}  ${TEST_NAME}
    ${SAUCE_OPTIONS}=    Create Dictionary               name     ${SAUCE_TEST_NAME}
    Set To Dictionary    ${DESIRED_CAPS}  sauce:options  ${SAUCE_OPTIONS}
    Open Application     ${REMOTE_URL}    &{DESIRED_CAPS}
    Eyes Configure Add Property     RUNNER    ${RUNNER}
    Eyes Configure Add Property     BACKEND_LIBRARY_NAME    ${RUNNER}


Teardown
    Close Application
    Eyes Close Async


*** Test Cases ***
Check Window Native
    Eyes Open    Check Window Native ${RUNNER}    batch=${BATCH_NAME}
    Sleep  10s
    Eyes Check Window    Ignore Region By Coordinates    [12 22 2 2]
