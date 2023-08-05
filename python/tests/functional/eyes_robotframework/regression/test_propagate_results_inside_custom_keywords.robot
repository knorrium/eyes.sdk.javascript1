*** Settings ***
Library     SeleniumLibrary
Library     EyesLibrary       runner=web_ufg    config=applitools.yaml

Test Setup        Setup
Test Teardown     Teardown


*** Keywords ***
Setup
    Open Browser    https://demo.applitools.com    headlesschrome
    Eyes Open


Teardown
    Eyes Close Async
    Close All Browsers


Process
    [Arguments]    ${test_name}
    Eyes Check Window    ${test_name}    Fully


*** Test Cases ***
Log into bank account
    Process    Test1
    Input Text        id:username    applibot
    Input Text        id:password    I<3VisualTests
    Click Element     id:log-in
    Process    Test2
