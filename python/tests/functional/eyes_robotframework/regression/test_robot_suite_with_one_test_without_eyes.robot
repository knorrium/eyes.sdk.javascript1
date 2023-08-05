*** Settings ***
Library     SeleniumLibrary
Library     EyesLibrary  runner=web_ufg  config=applitools.yaml


*** Test Cases ***
Test That does not use Eyes
    Open Browser   https://demo.applitools.com   chrome  options=add_argument("--headless")
    Close Browser

Test that uses Eyes
    Open Browser   https://demo.applitools.com   chrome  options=add_argument("--headless")
    Eyes Open
    Eyes Check Window
    Eyes Close Async
    Close Browser
