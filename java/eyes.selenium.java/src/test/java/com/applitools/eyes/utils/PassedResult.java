package com.applitools.eyes.utils;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PassedResult {
    @JsonProperty("passed")
    boolean isPassed;

    public PassedResult(boolean isPassedResult) {
        this.isPassed = isPassedResult;
    }

    @JsonProperty("passed")
    public boolean isPassed() {
        return isPassed;
    }

    @JsonProperty("passed")
    public void setPassed(boolean passed) {
        isPassed = passed;
    }
}
