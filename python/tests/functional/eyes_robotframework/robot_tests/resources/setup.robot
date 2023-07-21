*** Settings ***
Library  Collections
Library  String

*** Variables ***
${URL}                          https://demo.applitools.com/
${BROWSER_NAME}                 Chrome
${FORM_XPATH}                   //html/body/div/div/form
${FORM_USERNAME_XPATH}          //html/body/div/div/form/div[1]

*** Keywords ***
Setup
    ${SAUCE_TEST_NAME}=   Format String  sauce:job-name\=Robot|{} {}  ${RUNNER}  ${TEST_NAME}
    IF  '${BACKEND_LIBRARY_NAME}' == 'AppiumLibrary'
        Open Application        ${REMOTE_URL}    &{DESIRED_CAPS}
        Execute Script  ${SAUCE_TEST_NAME}
        IF  '${RUNNER}' == 'web'
            Go To Url   ${URL}
        END
    ELSE IF  '${BACKEND_LIBRARY_NAME}' == 'SeleniumLibrary'
        Open Browser   ${URL}   ${BROWSER_NAME}   remote_url=${REMOTE_URL}   desired_capabilities=${DESIRED CAPS}    options=add_argument("--headless")
        Run Keyword If  'sauce' in '${REMOTE_URL}'  Execute Javascript  ${SAUCE_TEST_NAME}
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
