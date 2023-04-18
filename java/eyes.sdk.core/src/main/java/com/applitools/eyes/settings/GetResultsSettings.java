package com.applitools.eyes.settings;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GetResultsSettings {

    private Boolean throwErr;
    private Boolean removeDuplicateTests;

    public GetResultsSettings(boolean shouldThrowException) {
        this.throwErr = shouldThrowException;
    }

    public GetResultsSettings(Boolean throwErr, Boolean removeDuplicateTests) {
        this.throwErr = throwErr;
        this.removeDuplicateTests = removeDuplicateTests;
    }


    public Boolean getThrowErr() {
        return throwErr;
    }

    public void setThrowErr(Boolean throwErr) {
        this.throwErr = throwErr;
    }

    public Boolean getRemoveDuplicateTests() {
        return removeDuplicateTests;
    }

    public void setRemoveDuplicateTests(Boolean removeDuplicateTests) {
        this.removeDuplicateTests = removeDuplicateTests;
    }
}
