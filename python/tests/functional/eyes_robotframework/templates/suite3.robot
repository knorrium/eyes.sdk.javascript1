*** Settings ***
Library     SeleniumLibrary
Library     EyesLibrary     runner=${RUNNER}      config=applitools.yaml

*** Test Cases ***
Check Window Suite 3
    Open Browser  https://applitools.github.io/demo/TestPages/FramesTestPage/  chrome  options=add_argument("--headless")
    Eyes Open
    Eyes Check Window
    Eyes Close Async
    Close All Browsers

