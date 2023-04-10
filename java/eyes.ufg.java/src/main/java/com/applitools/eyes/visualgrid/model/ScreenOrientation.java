package com.applitools.eyes.visualgrid.model;

import java.util.Arrays;

import com.applitools.eyes.selenium.BrowserType;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ScreenOrientation {

    PORTRAIT("portrait"),
    LANDSCAPE("landscape");

    private final String orientation;

    ScreenOrientation(String orientation) {
        this.orientation = orientation;
    }

    @JsonValue
    public String getOrientation() {
        return orientation;
    }

    /**
     * @return the Enum representation for the given string.
     * @throws IllegalArgumentException if unknown string.
     */
    public static ScreenOrientation fromOrientation(String value) throws IllegalArgumentException {
        return Arrays.stream(ScreenOrientation.values())
            .filter(v -> v.orientation.equalsIgnoreCase(value))
            .findFirst()
            .orElse(null);
    }
}
