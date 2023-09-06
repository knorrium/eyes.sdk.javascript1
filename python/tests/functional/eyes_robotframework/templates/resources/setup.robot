*** Settings ***
Library  Collections
Library  String

*** Variables ***
${REMOTE_URL}  https://%{SAUCE_USERNAME}:%{SAUCE_ACCESS_KEY}@ondemand.us-west-1.saucelabs.com:443/wd/hub
${URL}                          https://demo.applitools.com/
${BROWSER_NAME}                 Chrome
${FORM_XPATH}                   //html/body/div/div/form
${FORM_USERNAME_XPATH}          //html/body/div/div/form/div[1]

*** Keywords ***
Setup
    ${SAUCE_TEST_NAME}=  Format String                   Robot|{} {}  ${RUNNER}  ${TEST_NAME}
    ${SAUCE_OPTIONS}=    Create Dictionary               name     ${SAUCE_TEST_NAME}
    Set To Dictionary    ${DESIRED_CAPS}  sauce:options  ${SAUCE_OPTIONS}
    IF  '${BACKEND_LIBRARY_NAME}' == 'AppiumLibrary'
        Open Application        ${REMOTE_URL}    &{DESIRED_CAPS}
        IF  '${RUNNER}' == 'web'
            Go To Url   ${URL}
        END
    ELSE IF  '${BACKEND_LIBRARY_NAME}' == 'SeleniumLibrary'
        Open Browser   ${URL}   ${BROWSER_NAME}   remote_url=${REMOTE_URL}   desired_capabilities=${DESIRED CAPS}    options=add_argument("--headless")
    END
    Eyes Configure Add Property     RUNNER    ${RUNNER}
    Eyes Configure Add Property     BACKEND_LIBRARY_NAME    ${RUNNER}


Teardown
    IF  '${BACKEND_LIBRARY_NAME}' == 'AppiumLibrary'
        Close Application
    ELSE IF  '${BACKEND_LIBRARY_NAME}' == 'SeleniumLibrary'
        Close All Browsers
    END
    Eyes Close Async
